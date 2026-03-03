/**
 * Call Socket Handler
 * 
 * Handles all WebRTC signaling with proper session management,
 * race condition handling, and call persistence.
 */

import callSessionManager from './CallSessionManager.js';

/**
 * Register all call-related socket events
 */
export function registerCallHandlers(io, socket, onlineUsers) {
  const userId = socket.handshake.query.userId;

  // ==================== CALL INITIATION ====================
  
  /**
   * User initiates a call
   */
  socket.on('callUser', async ({ to, offer, callType, callerName, callerAvatar }) => {
    console.log(`📞 [CALL] ${userId} calling ${to} (${callType})`);

    // Create session with race condition handling
    const result = callSessionManager.createSession(
      userId,
      to,
      callType,
      { name: callerName, avatar: callerAvatar }
    );

    if (!result.success) {
      // Handle failure reasons
      if (result.reason === 'CALLER_BUSY') {
        socket.emit('callFailed', { 
          reason: 'ALREADY_IN_CALL',
          message: 'You are already in a call' 
        });
      } else if (result.reason === 'RECEIVER_BUSY') {
        socket.emit('callBusy', { 
          message: 'User is busy on another call' 
        });
      } else if (result.reason === 'RACE_CONDITION_RECEIVER_CALLING') {
        // The other user is also calling us - their call wins
        socket.emit('callFailed', {
          reason: 'SIMULTANEOUS_CALL',
          message: 'Call conflict detected',
          incomingCallFrom: to
        });
      }
      return;
    }

    const { sessionId, session } = result;

    // Store offer
    callSessionManager.setOffer(sessionId, offer);

    // Check if receiver is online
    const receiverSocketId = onlineUsers.get(to);

    if (!receiverSocketId) {
      // User offline - notify caller
      socket.emit('callQueued', {
        message: 'User is offline',
        sessionId
      });
      
      // End session after short delay
      setTimeout(() => {
        callSessionManager.endSession(sessionId, 'USER_OFFLINE');
      }, 3000);
      
      return;
    }

    // Send incoming call to receiver
    io.to(receiverSocketId).emit('incomingCall', {
      sessionId,
      from: userId,
      callType,
      callerName,
      callerAvatar,
      offer,
    });

    // Notify caller that call is ringing
    socket.emit('callRinging', { sessionId });

    console.log(`✅ [CALL] Session created: ${sessionId}`);
  });


  // ==================== CALL ACCEPTANCE ====================
  
  /**
   * Receiver accepts the call
   * BACKWARD COMPATIBLE: Accepts both { sessionId, answer } and { to, answer }
   */
  socket.on('answerCall', async ({ sessionId, to, answer }) => {
    console.log(`✅ [CALL] User ${userId} accepting call`);

    // Get session by sessionId (new) or by userId (old)
    let session;
    if (sessionId) {
      session = callSessionManager.sessions.get(sessionId);
    } else if (userId) {
      session = callSessionManager.getUserSession(userId);
    }

    if (!session) {
      socket.emit('callFailed', {
        reason: 'SESSION_NOT_FOUND',
        message: 'Call session not found'
      });
      return;
    }

    const actualSessionId = session.id;
    const result = callSessionManager.acceptCall(actualSessionId, answer);

    if (!result.success) {
      socket.emit('callFailed', {
        reason: result.reason,
        message: 'Could not accept call'
      });
      return;
    }

    // Send answer to caller
    const callerSocketId = onlineUsers.get(session.callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit('callAccepted', {
        sessionId: actualSessionId,
        answer,
      });
    }

    console.log(`✅ [CALL] Call accepted: ${actualSessionId}`);
  });


  // ==================== CALL REJECTION ====================
  
  /**
   * Receiver rejects the call
   * BACKWARD COMPATIBLE: Accepts both { sessionId } and { to }
   */
  socket.on('rejectCall', ({ sessionId, to }) => {
    console.log(`❌ [CALL] User ${userId} rejecting call`);

    // Get session
    let session;
    if (sessionId) {
      session = callSessionManager.sessions.get(sessionId);
    } else if (userId) {
      session = callSessionManager.getUserSession(userId);
    }

    if (!session) {
      console.log(`⚠️ [CALL] No session to reject for user ${userId}`);
      return;
    }

    const actualSessionId = session.id;
    callSessionManager.rejectCall(actualSessionId);

    // Notify caller
    const callerSocketId = onlineUsers.get(session.callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit('callRejected', { sessionId: actualSessionId });
    }
  });


  // ==================== CALL CONNECTION ====================
  
  /**
   * WebRTC connection established
   */
  socket.on('callConnected', ({ sessionId }) => {
    console.log(`🎉 [CALL] WebRTC connected: ${sessionId}`);
    
    callSessionManager.markConnected(sessionId);

    const session = callSessionManager.sessions.get(sessionId);
    if (session) {
      // Notify both parties
      const callerSocketId = onlineUsers.get(session.callerId);
      const receiverSocketId = onlineUsers.get(session.receiverId);

      if (callerSocketId) {
        io.to(callerSocketId).emit('callFullyConnected', { sessionId });
      }
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('callFullyConnected', { sessionId });
      }
    }
  });


  // ==================== CALL END ====================
  
  /**
   * Either party ends the call
   * BACKWARD COMPATIBLE: Accepts both { sessionId } and { to }
   */
  socket.on('endCall', ({ sessionId, to }) => {
    console.log(`📵 [CALL] User ${userId} ending session`);

    let session;
    
    // Try to get session by sessionId (new format)
    if (sessionId) {
      session = callSessionManager.sessions.get(sessionId);
    }
    
    // Fallback: get session by userId (old format)
    if (!session && userId) {
      session = callSessionManager.getUserSession(userId);
    }

    if (!session) {
      console.log(`⚠️ [CALL] No active session found for user ${userId}`);
      return;
    }

    const actualSessionId = session.id;
    callSessionManager.endSession(actualSessionId, 'ENDED');

    // Notify the other party
    const otherUserId = session.callerId === userId ? session.receiverId : session.callerId;
    const otherSocketId = onlineUsers.get(otherUserId);

    if (otherSocketId) {
      io.to(otherSocketId).emit('callEnded', { sessionId: actualSessionId });
    }
  });


  // ==================== ICE CANDIDATES ====================
  
  /**
   * ICE candidate exchange
   * BACKWARD COMPATIBLE: Accepts both { sessionId, candidate } and { to, candidate }
   */
  socket.on('iceCandidate', ({ sessionId, to, candidate }) => {
    // Get session
    let session;
    if (sessionId) {
      session = callSessionManager.sessions.get(sessionId);
    } else if (userId) {
      session = callSessionManager.getUserSession(userId);
    }

    if (!session) {
      console.log(`⚠️ [ICE] No active session for user ${userId}`);
      return;
    }

    const actualSessionId = session.id;

    // Determine recipient (use 'to' param if provided, otherwise derive from session)
    const recipientId = to || (session.callerId === userId ? session.receiverId : session.callerId);
    const recipientSocketId = onlineUsers.get(recipientId);

    if (recipientSocketId) {
      // Send immediately if online
      io.to(recipientSocketId).emit('iceCandidate', {
        sessionId: actualSessionId,
        candidate,
      });
      console.log(`🧊 [ICE] Forwarded candidate: ${actualSessionId}`);
    } else {
      // Queue if offline (will be sent on reconnect)
      callSessionManager.addIceCandidate(actualSessionId, candidate, userId);
      console.log(`🧊 [ICE] Queued candidate: ${actualSessionId}`);
    }
  });


  // ==================== CALL RECOVERY ====================
  
  /**
   * User reconnects and requests active session
   */
  socket.on('recoverSession', () => {
    console.log(`🔄 [RECOVER] User ${userId} requesting session recovery`);

    const session = callSessionManager.getUserSession(userId);

    if (!session) {
      socket.emit('noActiveSession');
      return;
    }

    // Check if session is still active
    if (!['RINGING', 'CONNECTING', 'CONNECTED'].includes(session.state)) {
      socket.emit('noActiveSession');
      return;
    }

    // Send session data
    socket.emit('sessionRecovered', {
      sessionId: session.id,
      state: session.state,
      callType: session.callType,
      iscaller: session.callerId === userId,
      otherUserId: session.callerId === userId ? session.receiverId : session.callerId,
      offer: session.offer,
      answer: session.answer,
    });

    // Send queued ICE candidates
    const candidates = callSessionManager.getIceCandidates(session.id, userId);
    candidates.forEach(candidate => {
      socket.emit('iceCandidate', {
        sessionId: session.id,
        candidate,
      });
    });

    console.log(`✅ [RECOVER] Session recovered: ${session.id}`);
  });


  // ==================== CALL HISTORY ====================
  
  /**
   * Get missed calls
   */
  socket.on('getCallHistory', () => {
    const history = callSessionManager.getHistory(userId);
    socket.emit('callHistory', history);
  });

  /**
   * Clear call history
   */
  socket.on('clearCallHistory', () => {
    callSessionManager.clearHistory(userId);
    socket.emit('callHistoryCleared');
  });


  // ==================== DISCONNECT HANDLING ====================
  
  /**
   * Handle user disconnect
   */
  const handleDisconnect = () => {
    console.log(`🔴 [DISCONNECT] User ${userId} disconnected`);
    
    const result = callSessionManager.handleUserDisconnect(userId);
    
    if (result.disconnected) {
      // Notify other party
      const otherSocketId = onlineUsers.get(result.otherUserId);
      if (otherSocketId) {
        io.to(otherSocketId).emit('callEnded', {
          sessionId: result.sessionId,
          reason: 'USER_DISCONNECTED',
        });
      }
    }
  };

  // Register disconnect handler
  socket.on('disconnect', handleDisconnect);
}


/**
 * Get active sessions (for debugging/admin)
 */
export function getActiveSessions() {
  return callSessionManager.getActiveSessions();
}
