/**
 * Call Session Manager
 * 
 * This manages call sessions with proper state tracking, race condition handling,
 * and persistence. In production, replace in-memory storage with Redis for scalability.
 * 
 * Call States:
 * - IDLE: No call
 * - INITIATING: Call being set up (caller side)
 * - RINGING: Call is ringing (receiver side)
 * - CONNECTING: WebRTC negotiation in progress
 * - CONNECTED: Active call
 * - ENDED: Call completed
 * - REJECTED: Call declined
 * - MISSED: Call not answered
 * - BUSY: User unavailable
 * - FAILED: Technical failure
 */

class CallSessionManager {
  constructor() {
    // Active call sessions: sessionId -> session data
    this.sessions = new Map();
    
    // User to session mapping: userId -> sessionId
    this.userSessions = new Map();
    
    // Call history for missed calls
    this.callHistory = new Map();
    
    // Maximum history entries per user
    this.MAX_HISTORY = 50;
    
    // Call timeout durations
    this.RING_TIMEOUT = 60000; // 60 seconds
    this.CONNECT_TIMEOUT = 30000; // 30 seconds
  }

  /**
   * Generate unique session ID
   */
  generateSessionId(callerId, receiverId) {
    return `${callerId}_${receiverId}_${Date.now()}`;
  }

  /**
   * Check if user is in any active call
   */
  isUserInCall(userId) {
    const sessionId = this.userSessions.get(userId);
    if (!sessionId) return false;
    
    const session = this.sessions.get(sessionId);
    return session && ['CONNECTING', 'CONNECTED', 'RINGING', 'INITIATING'].includes(session.state);
  }

  /**
   * Get active session for user
   */
  getUserSession(userId) {
    const sessionId = this.userSessions.get(userId);
    return sessionId ? this.sessions.get(sessionId) : null;
  }

  /**
   * Create a new call session
   * Returns { success, sessionId, reason }
   */
  createSession(callerId, receiverId, callType, callerInfo = {}) {
    // Check if either user is already in a call
    if (this.isUserInCall(callerId)) {
      return { success: false, reason: 'CALLER_BUSY' };
    }
    
    if (this.isUserInCall(receiverId)) {
      return { success: false, reason: 'RECEIVER_BUSY' };
    }

    // Handle race condition: both users calling each other simultaneously
    // Choose the user with smaller ID as the "winner" to avoid double calls
    const existingReceiverSession = this.getUserSession(receiverId);
    if (existingReceiverSession && 
        existingReceiverSession.state === 'INITIATING' &&
        existingReceiverSession.receiverId === callerId) {
      
      if (callerId < receiverId) {
        // Current caller wins, cancel receiver's outgoing call
        this.endSession(existingReceiverSession.id, 'RACE_CONDITION_RESOLVED');
      } else {
        // Receiver's call wins, reject this one
        return { success: false, reason: 'RACE_CONDITION_RECEIVER_CALLING' };
      }
    }

    const sessionId = this.generateSessionId(callerId, receiverId);
    
    const session = {
      id: sessionId,
      callerId,
      receiverId,
      callType, // 'audio' or 'video'
      state: 'INITIATING',
      callerInfo, // { name, avatar }
      createdAt: Date.now(),
      startedAt: null,
      endedAt: null,
      offer: null,
      answer: null,
      iceQueueCaller: [],
      iceQueueReceiver: [],
    };

    this.sessions.set(sessionId, session);
    this.userSessions.set(callerId, sessionId);
    this.userSessions.set(receiverId, sessionId);

    // Set timeout for ringing
    session.ringTimeout = setTimeout(() => {
      if (session.state === 'RINGING' || session.state === 'INITIATING') {
        this.endSession(sessionId, 'MISSED');
      }
    }, this.RING_TIMEOUT);

    console.log(`✅ Session created: ${sessionId} (${callerId} -> ${receiverId})`);
    
    return { success: true, sessionId, session };
  }

  /**
   * Store offer for session
   */
  setOffer(sessionId, offer) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    
    session.offer = offer;
    session.state = 'RINGING';
    session.ringingAt = Date.now();
    
    console.log(`📞 Offer set for session: ${sessionId}`);
    return true;
  }

  /**
   * Accept a call (store answer)
   */
  acceptCall(sessionId, answer) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { success: false, reason: 'SESSION_NOT_FOUND' };
    }
    
    if (session.state !== 'RINGING') {
      return { success: false, reason: 'INVALID_STATE' };
    }

    session.answer = answer;
    session.state = 'CONNECTING';
    session.startedAt = Date.now();
    
    // Clear ring timeout
    if (session.ringTimeout) {
      clearTimeout(session.ringTimeout);
    }

    // Set connection timeout
    session.connectTimeout = setTimeout(() => {
      if (session.state === 'CONNECTING') {
        this.endSession(sessionId, 'FAILED');
      }
    }, this.CONNECT_TIMEOUT);

    console.log(`✅ Call accepted: ${sessionId}`);
    return { success: true, session };
  }

  /**
   * Mark call as connected (WebRTC established)
   */
  markConnected(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    
    session.state = 'CONNECTED';
    session.connectedAt = Date.now();
    
    // Clear connection timeout
    if (session.connectTimeout) {
      clearTimeout(session.connectTimeout);
    }

    console.log(`🎉 Call connected: ${sessionId}`);
    return true;
  }

  /**
   * Reject a call
   */
  rejectCall(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    
    session.state = 'REJECTED';
    this.endSession(sessionId, 'REJECTED');
    
    console.log(`❌ Call rejected: ${sessionId}`);
    return true;
  }

  /**
   * End a call session
   */
  endSession(sessionId, reason = 'ENDED') {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.state = reason;
    session.endedAt = Date.now();

    // Clear any timeouts
    if (session.ringTimeout) clearTimeout(session.ringTimeout);
    if (session.connectTimeout) clearTimeout(session.connectTimeout);

    // Add to history if missed or rejected
    if (reason === 'MISSED') {
      this.addToHistory(session.receiverId, {
        type: 'MISSED_CALL',
        from: session.callerId,
        callerInfo: session.callerInfo,
        callType: session.callType,
        timestamp: Date.now(),
      });
    }

    // Clean up mappings
    this.userSessions.delete(session.callerId);
    this.userSessions.delete(session.receiverId);

    // Keep session for a short time for debugging
    setTimeout(() => {
      this.sessions.delete(sessionId);
      console.log(`🗑️ Session cleaned up: ${sessionId}`);
    }, 5000);

    console.log(`📵 Session ended: ${sessionId} (${reason})`);
    return true;
  }

  /**
   * Add ICE candidate to queue
   */
  addIceCandidate(sessionId, candidate, fromUserId) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    if (fromUserId === session.callerId) {
      session.iceQueueCaller.push(candidate);
    } else {
      session.iceQueueReceiver.push(candidate);
    }

    return true;
  }

  /**
   * Get ICE candidates for user
   */
  getIceCandidates(sessionId, userId) {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    if (userId === session.callerId) {
      return session.iceQueueReceiver.splice(0);
    } else {
      return session.iceQueueCaller.splice(0);
    }
  }

  /**
   * Add to call history
   */
  addToHistory(userId, entry) {
    if (!this.callHistory.has(userId)) {
      this.callHistory.set(userId, []);
    }

    const history = this.callHistory.get(userId);
    history.unshift(entry);

    // Limit history size
    if (history.length > this.MAX_HISTORY) {
      history.pop();
    }
  }

  /**
   * Get call history for user
   */
  getHistory(userId) {
    return this.callHistory.get(userId) || [];
  }

  /**
   * Clear call history for user
   */
  clearHistory(userId) {
    this.callHistory.delete(userId);
  }

  /**
   * Get all active sessions (for debugging)
   */
  getActiveSessions() {
    const active = [];
    for (const [id, session] of this.sessions.entries()) {
      if (['INITIATING', 'RINGING', 'CONNECTING', 'CONNECTED'].includes(session.state)) {
        active.push({ id, ...session });
      }
    }
    return active;
  }

  /**
   * Cleanup on user disconnect
   */
  handleUserDisconnect(userId) {
    const sessionId = this.userSessions.get(userId);
    if (sessionId) {
      const session = this.sessions.get(sessionId);
      if (session) {
        // Determine who disconnected
        const otherUserId = session.callerId === userId ? session.receiverId : session.callerId;
        
        this.endSession(sessionId, 'DISCONNECTED');
        
        return { disconnected: true, otherUserId, sessionId };
      }
    }
    return { disconnected: false };
  }
}

export default new CallSessionManager();
