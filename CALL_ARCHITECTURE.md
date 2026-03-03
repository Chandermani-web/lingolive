# WebRTC Call System Architecture

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [State Machine](#state-machine)
4. [Socket Event Flow](#socket-event-flow)
5. [Race Condition Handling](#race-condition-handling)
6. [Call Recovery](#call-recovery)
7. [Implementation Guide](#implementation-guide)
8. [Production Best Practices](#production-best-practices)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This is a **production-ready WebRTC calling system** for MERN stack applications with:

- **Persistent call sessions** - Survives page refresh and reconnections
- **Race condition handling** - Prevents double calls when users call each other simultaneously
- **Proper state machine** - Clear call lifecycle management
- **ICE candidate buffering** - Handles candidates arriving before offer/answer
- **Automatic reconnection** - Recovers from temporary disconnections
- **Mobile optimized** - Works on phones and tablets
- **Scalable architecture** - Ready for Redis/database integration

---

## 🏗️ Architecture

### **Components**

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND                          │
├─────────────────────────────────────────────────────┤
│  ImprovedCallContext.jsx                            │
│  ├─ State machine (IDLE → CONNECTED → ENDED)       │
│  ├─ WebRTC peer connection management              │
│  ├─ Media stream handling                           │
│  └─ Socket event handlers                           │
│                                                      │
│  webrtcHelper.js                                    │
│  ├─ ICE server configuration                        │
│  ├─ Media constraints (audio/video)                 │
│  ├─ Connection quality monitoring                   │
│  └─ Error handling                                  │
└─────────────────────────────────────────────────────┘
                        ↕️ Socket.IO
┌─────────────────────────────────────────────────────┐
│                   BACKEND                           │
├─────────────────────────────────────────────────────┤
│  callSocketHandler.js                              │
│  ├─ Event routing                                   │
│  ├─ Session validation                              │
│  └─ User notification                               │
│                                                      │
│  CallSessionManager.js                             │
│  ├─ Session creation/tracking                       │
│  ├─ Race condition resolution                       │
│  ├─ ICE candidate queueing                          │
│  ├─ Call history (missed calls)                     │
│  └─ Timeout management                              │
└─────────────────────────────────────────────────────┘
```

### **Data Flow**

```
User A                Frontend A              Backend              Frontend B              User B
  │                      │                       │                      │                     │
  │──Start Video Call───→│                       │                      │                     │
  │                      │──callUser(offer)─────→│                      │                     │
  │                      │                       │──Check if B busy────→│                     │
  │                      │                       │──Create session      │                     │
  │                      │                       │──incomingCall────────→│                     │
  │                      │                       │                      │──Show modal────────→│
  │                      │                       │                      │                     │
  │                      │                       │                      │←──Accept Call───────│
  │                      │                       │←──answerCall(answer)─│                     │
  │                      │←──callAccepted────────│                      │                     │
  │                      │                       │                      │                     │
  │                      │──ICE candidates──────→│──ICE candidates─────→│                     │
  │                      │←──ICE candidates──────│←──ICE candidates─────│                     │
  │                      │                       │                      │                     │
  │←──Connected─────────│     WebRTC P2P       │                      │──Connected─────────→│
  │                      │←═══════════════════════════════════════════→│                     │
  │                      │         Audio/Video                          │                     │
```

---

## 🔄 State Machine

### **Call States**

```javascript
IDLE          → No active call
INITIATING    → Caller creating offer
RINGING       → Receiver sees incoming call
CALLING       → Caller waiting for answer
CONNECTING    → WebRTC negotiation in progress
CONNECTED     → Call active (media flowing)
ENDING        → Call being terminated
ENDED         → Call finished
FAILED        → Technical failure
BUSY          → Receiver on another call
REJECTED      → Receiver declined
```

### **State Transitions**

```
                         ┌──────────────┐
                    ┌────│     IDLE     │────┐
                    │    └──────────────┘    │
                    │                        │
            startCall()                 incomingCall
                    │                        │
                    ↓                        ↓
            ┌──────────────┐        ┌──────────────┐
            │  INITIATING  │        │   RINGING    │
            └──────────────┘        └──────────────┘
                    │                        │
         offer sent │                        │ acceptCall()
                    │                        │
                    ↓                        ↓
            ┌──────────────┐        ┌──────────────┐
            │   CALLING    │───────→│ CONNECTING   │
            └──────────────┘        └──────────────┘
                    │                        │
                    │    answer received     │
                    └────────────────────────┘
                                │
                    WebRTC connected
                                │
                                ↓
                        ┌──────────────┐
                        │  CONNECTED   │
                        └──────────────┘
                                │
                         endCall()
                                │
                                ↓
                        ┌──────────────┐
                        │    ENDED     │
                        └──────────────┘
                                │
                                ↓
                        ┌──────────────┐
                        │     IDLE     │
                        └──────────────┘
```

---

## 📡 Socket Event Flow

### **1. Call Initiation (Caller Side)**

```
Frontend                          Backend                          Frontend
(User A)                                                          (User B)

┌─────────────────────────────────────────────────────────────────────────┐
│ 1. USER INITIATES CALL                                                  │
└─────────────────────────────────────────────────────────────────────────┘

startCall(userB, "video") ────→  callUser
                                   ├─ createSession(A, B)
                                   ├─ Check race conditions
                                   ├─ Check if B is busy
                                   └─ Store offer
                                          │
                                          │ incomingCall(offer) ────→ Show modal
                                          │
callRinging ←──────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│ 2. CALL ACCEPTANCE                                                      │
└─────────────────────────────────────────────────────────────────────────┘

                                                                acceptCall()
                                                                     │
                                   answerCall(answer) ←──────────────┤
                                   ├─ Store answer
                                   ├─ Mark CONNECTING
                                   └─ Forward answer
                                          │
callAccepted(answer) ←─────────────┘
     │
     └─ setRemoteDescription


┌─────────────────────────────────────────────────────────────────────────┐
│ 3. ICE CANDIDATE EXCHANGE                                               │
└─────────────────────────────────────────────────────────────────────────┘

iceCandidate(candidate) ──────→  Forward ──────→ iceCandidate(candidate)
                                                        │
                                                  addIceCandidate()

iceCandidate(candidate) ←──────  Forward ←──────  iceCandidate(candidate)
     │
addIceCandidate()


┌─────────────────────────────────────────────────────────────────────────┐
│ 4. CONNECTION ESTABLISHED                                               │
└─────────────────────────────────────────────────────────────────────────┘

callConnected ────────────────→  Mark session CONNECTED


┌─────────────────────────────────────────────────────────────────────────┐
│ 5. CALL TERMINATION                                                     │
└─────────────────────────────────────────────────────────────────────────┘

endCall() ────────────────────→  endCall
                                   ├─ Clean up session
                                   └─ Notify other user
                                          │
                                          │ callEnded ──────────→ Show "Call ended"
```

---

## 🔀 Race Condition Handling

### **Problem: Both users call each other simultaneously**

```
User A calls User B
    ↓
User B calls User A  (at the same time)
    ↓
    ? Which call should proceed?
```

### **Solution: Deterministic winner selection**

```javascript
// In CallSessionManager.js

createSession(callerId, receiverId, callType, callerInfo) {
  // Check if receiver is also initiating a call to caller
  const existingReceiverSession = this.getUserSession(receiverId);
  
  if (existingReceiverSession && 
      existingReceiverSession.state === 'INITIATING' &&
      existingReceiverSession.receiverId === callerId) {
    
    // Both calling each other - use ID comparison to pick winner
    if (callerId < receiverId) {
      // Current caller wins
      this.endSession(existingReceiverSession.id, 'RACE_CONDITION_RESOLVED');
      // Continue with current call
    } else {
      // Receiver's call wins
      return { 
        success: false, 
        reason: 'RACE_CONDITION_RECEIVER_CALLING' 
      };
    }
  }
  
  // Create session...
}
```

### **Result**

- Only one call proceeds
- The "loser" gets notified to expect an incoming call
- No duplicate calls or confusion

---

## 🔄 Call Recovery

### **Problem: Call disappears on page refresh**

Traditional approach loses call state on refresh because:
- Socket connection drops
- Component state is lost
- WebRTC connection breaks

### **Solution: Backend session persistence**

```javascript
// On reconnect
useEffect(() => {
  if (socket && user) {
    socket.emit("recoverSession");
  }
}, [socket, user]);

// Backend responds
socket.on("sessionRecovered", (data) => {
  // Restore call state
  setSessionId(data.sessionId);
  setCallState(data.state);
  setCallType(data.callType);
  // ... restore offer/answer
  // ... restore ICE candidates
});
```

### **Flow**

```
1. User in call refreshes page
   └─> Socket disconnects
   └─> Frontend state lost

2. Page reloads
   └─> Socket reconnects
   └─> Frontend sends "recoverSession"

3. Backend checks for active session
   └─> Finds session for this user
   └─> Sends session data back

4. Frontend restores state
   └─> Recreates peer connection
   └─> Reestablishes media
   └─> Call continues
```

---

## 🛠️ Implementation Guide

### **Step 1: Backend Setup**

1. **Copy files to backend:**
   ```
   backend/src/services/
   ├── CallSessionManager.js
   └── callSocketHandler.js
   ```

2. **Update backend/src/index.js:**
   ```javascript
   import { registerCallHandlers } from "./services/callSocketHandler.js";
   
   io.on("connection", (socket) => {
     // ... existing code
     registerCallHandlers(io, socket, onlineUsers);
   });
   ```

### **Step 2: Frontend Setup**

1. **Copy files to frontend:**
   ```
   frontend/src/
   ├── Context/
   │   └── ImprovedCallContext.jsx
   └── utils/
       └── webrtcHelper.js
   ```

2. **Update main.jsx or App.jsx:**
   ```javascript
   import { CallProvider } from "./Context/ImprovedCallContext";
   
   <CallProvider>
     {/* Your app */}
   </CallProvider>
   ```

3. **Update components to use new context:**
   ```javascript
   import { useCall, CALL_STATES } from "./Context/ImprovedCallContext";
   
   const { startCall, acceptCall, rejectCall, callState } = useCall();
   ```

### **Step 3: Update UI Components**

Your existing CallModal and VideoCallUI should work with minimal changes:

```javascript
// CallModal.jsx
const { incomingCall, acceptCall, rejectCall } = useCall();

// VideoCallUI.jsx
const { 
  callActive, 
  localStream, 
  remoteStream, 
  endCall,
  toggleMute,
  toggleVideo,
  isMuted,
  isVideoOff
} = useCall();
```

---

## 🚀 Production Best Practices

### **1. Use Your Own TURN Servers**

Free TURN servers have limitations. For production:

```javascript
// webrtcHelper.js
export const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.yourdomain.com:3478" },
    {
      urls: "turn:turn.yourdomain.com:3478",
      username: "your-username",
      credential: "your-password",
    },
  ],
};
```

**Recommended TURN providers:**
- **Twilio** - Most reliable, built for scale
- **Xirsys** - Good pricing
- **Self-hosted** - coturn (free, open-source)

### **2. Replace In-Memory Storage with Redis**

```javascript
// backend/src/services/CallSessionManager.js

import Redis from 'ioredis';
const redis = new Redis();

class CallSessionManager {
  async createSession(callerId, receiverId, callType, callerInfo) {
    const sessionId = this.generateSessionId(callerId, receiverId);
    
    const session = { /* ... */ };
    
    // Store in Redis with 1 hour expiry
    await redis.setex(
      `session:${sessionId}`,
      3600,
      JSON.stringify(session)
    );
    
    // Map user to session
    await redis.setex(`user:${callerId}`, 3600, sessionId);
    await redis.setex(`user:${receiverId}`, 3600, sessionId);
    
    return { success: true, sessionId, session };
  }
}
```

### **3. Add Call Analytics**

Track call quality and issues:

```javascript
// On call end
await logCallMetrics({
  sessionId,
  callerId,
  receiverId,
  duration: Date.now() - startedAt,
  connectionQuality: getConnectionStats(),
  disconnectReason,
});
```

### **4. Implement Call Timeouts**

```javascript
// backend/src/services/CallSessionManager.js

// Ring timeout - 60 seconds
session.ringTimeout = setTimeout(() => {
  if (session.state === 'RINGING') {
    this.endSession(sessionId, 'MISSED');
  }
}, 60000);

// Connection timeout - 30 seconds
session.connectTimeout = setTimeout(() => {
  if (session.state === 'CONNECTING') {
    this.endSession(sessionId, 'FAILED');
  }
}, 30000);
```

### **5. Handle Call Notifications**

```javascript
// Send push notification for missed calls
socket.on("callMissed", async ({ userId, callerId, callerName }) => {
  await sendPushNotification(userId, {
    title: `Missed call from ${callerName}`,
    body: "Tap to call back",
  });
});
```

### **6. Add Call History**

Store in database for permanent history:

```javascript
// models/CallLog.js
const CallLogSchema = new Schema({
  callerId: { type: ObjectId, ref: 'User' },
  receiverId: { type: ObjectId, ref: 'User' },
  type: { type: String, enum: ['audio', 'video'] },
  status: { type: String, enum: ['completed', 'missed', 'rejected'] },
  duration: Number, // seconds
  startedAt: Date,
  endedAt: Date,
});
```

### **7. Implement Call Recording** (if needed)

```javascript
const mediaRecorder = new MediaRecorder(localStream, {
  mimeType: 'video/webm',
});

mediaRecorder.ondataavailable = (event) => {
  chunks.push(event.data);
};

mediaRecorder.start();
```

### **8. Add Network Quality Detection**

```javascript
// Monitor connection in real-time
const monitor = setInterval(async () => {
  const stats = await getConnectionStats(peerConnection);
  
  if (stats.audio.packetsLost > 100) {
    showWarning("Poor connection quality");
  }
}, 5000);
```

---

## 🐛 Troubleshooting

### **Issue: Calls work laptop-to-laptop but fail on mobile**

**Cause:** Mobile browsers have stricter autoplay policies

**Solution:**
```javascript
// Play remote video explicitly
remoteVideoRef.current.play().catch(error => {
  console.log("Autoplay failed, user interaction required");
});
```

### **Issue: ICE connection stays "checking" and never connects**

**Possible causes:**
1. TURN server not working
2. Firewall blocking UDP
3. Symmetric NAT

**Debug:**
```javascript
peerConnection.addEventListener('icecandidate', (event) => {
  if (event.candidate) {
    console.log('Candidate type:', event.candidate.type);
    // Should see: host, srflx (STUN), relay (TURN)
  }
});
```

**Solution:** Ensure TURN servers are configured correctly

### **Issue: Audio works but video doesn't**

**Cause:** Video constraints too strict or camera already in use

**Solution:**
```javascript
try {
  stream = await getUserMedia('video');
} catch (error) {
  // Fallback to audio only
  console.warn("Video failed, falling back to audio");
  stream = await getUserMedia('audio');
}
```

### **Issue: Call disconnects randomly**

**Cause:** Mobile browser going to background

**Solution:**
```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log("App went to background");
    // Keep socket alive
    socket.emit('keepAlive');
  }
});
```

### **Issue: Both users call each other, see "User is on another call"**

**Fixed by:** Race condition handling in CallSessionManager

Check logs for: `RACE_CONDITION_RESOLVED`

---

## 📊 Performance Metrics

Expected performance:

| Metric | Target | Notes |
|--------|--------|-------|
| Call setup time | < 3s | Time from "call" to ringing |
| Time to connect | < 5s | Time from "accept" to media flowing |
| Mobile CPU usage | < 30% | On active call |
| Battery drain | < 5%/hour | On active video call |
| Max concurrent calls | 1000+ | With Redis + proper TURN |

---

## 🎓 Key Concepts Explained

### **What is ICE?**
Interactive Connectivity Establishment - finds the best path for peer-to-peer connection

### **What is STUN?**
Session Traversal Utilities for NAT - helps discover your public IP

### **What is TURN?**
Traversal Using Relays around NAT - relays media when P2P fails (behind strict firewalls)

### **What is SDP?**
Session Description Protocol - describes multimedia session (offer/answer)

---

## 📚 Additional Resources

- [WebRTC Spec](https://www.w3.org/TR/webrtc/)
- [MDN WebRTC Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [coturn TURN server](https://github.com/coturn/coturn)
- [Twilio STUN/TURN](https://www.twilio.com/docs/stun-turn)

---

## ✅ Migration Checklist

- [ ] Backend: Install new CallSessionManager
- [ ] Backend: Register call handlers in index.js
- [ ] Frontend: Add webrtcHelper.js
- [ ] Frontend: Replace CallContext with ImprovedCallContext
- [ ] Frontend: Update components to use new context
- [ ] Test: Laptop ↔ Laptop call
- [ ] Test: Phone ↔ Phone call
- [ ] Test: Laptop ↔ Phone call
- [ ] Test: Audio-only call
- [ ] Test: Video call
- [ ] Test: Call rejection
- [ ] Test: Call while user busy
- [ ] Test: Both users call each other simultaneously
- [ ] Test: Page refresh during call
- [ ] Test: Tab switch during call
- [ ] Test: User goes offline during call
- [ ] Production: Add your own TURN servers
- [ ] Production: Add Redis for session storage
- [ ] Production: Add call analytics
- [ ] Production: Add push notifications for missed calls

---

## 🎯 Expected Results After Implementation

✅ **Reliable connections** - Calls connect consistently across devices  
✅ **No race conditions** - Simultaneous calls handled gracefully  
✅ **Call persistence** - Calls survive refresh/reconnect  
✅ **Proper busy state** - Users can't be interrupted mid-call  
✅ **Better diagnostics** - Clear logs and error messages  
✅ **Mobile optimized** - Works reliably on phones  
✅ **Production ready** - Scalable architecture  

---

**Questions? Issues?**

Check the logs for detailed error messages. All components log extensively with emojis for easy debugging:
- 📞 = Call events
- 🧊 = ICE candidates
- 🔗 = Connection state
- ❌ = Errors
- ✅ = Success

Good luck! 🚀
