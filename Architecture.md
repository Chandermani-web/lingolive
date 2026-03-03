# LingoLive - Architecture & Flow Design

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Chat System](#chat-system)
5. [Voice & Video Call System](#voice--video-call-system)
6. [Real-time Communication Flow](#real-time-communication-flow)
7. [WebRTC Implementation](#webrtc-implementation)
8. [Socket.IO Events Reference](#socketio-events-reference)
9. [Data Models](#data-models)
10. [Key Components](#key-components)
11. [Sequence Diagrams](#sequence-diagrams)

---

## Overview

LingoLive is a real-time communication platform that enables users to:
- Send text messages with multimedia attachments (images, videos, audio, files)
- Make peer-to-peer voice calls
- Make peer-to-peer video calls
- Receive real-time notifications
- See online/offline status of users

### Architecture Pattern
- **Backend**: RESTful API + WebSocket (Socket.IO)
- **Frontend**: React SPA with Context API for state management
- **Real-time**: Socket.IO for signaling, WebRTC for media streaming

---

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Real-time**: Socket.IO
- **File Upload**: Multer + Cloudinary
- **Authentication**: JWT (JSON Web Tokens)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Real-time**: Socket.IO Client
- **WebRTC**: Native WebRTC APIs
- **State Management**: React Context API
- **UI Icons**: Lucide React, Remix Icon

### Communication Protocols
- **HTTP/HTTPS**: REST API calls
- **WebSocket**: Real-time bidirectional communication (Socket.IO)
- **WebRTC**: Peer-to-peer media streaming (STUN servers)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Chat UI    │  │   Call UI    │  │  Video UI    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│  ┌──────▼──────────────────▼──────────────────▼───────┐          │
│  │           Context Providers                         │          │
│  │  • SocketContext  • CallContext  • AppContext      │          │
│  └──────┬──────────────────┬──────────────────┬───────┘          │
│         │                  │                  │                   │
└─────────┼──────────────────┼──────────────────┼───────────────────┘
          │                  │                  │
          │ Socket.IO        │ Socket.IO        │ WebRTC (P2P)
          │ (Messages)       │ (Signaling)      │ (Media Streams)
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼───────────────────┐
│                      SERVER (Node.js)                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐                 ┌─────────────────┐          │
│  │  Express REST   │                 │  Socket.IO      │          │
│  │     API         │                 │   Server        │          │
│  └────────┬────────┘                 └────────┬────────┘          │
│           │                                   │                    │
│  ┌────────▼────────────────────────────────────▼────────┐          │
│  │              Controllers & Routes                     │          │
│  │  • message.controller.js  • Socket Event Handlers    │          │
│  │  • message.route.js                                  │          │
│  └────────┬──────────────────────────────────┬──────────┘          │
│           │                                   │                    │
│  ┌────────▼─────────┐              ┌─────────▼──────────┐          │
│  │   MongoDB        │              │  Online Users Map  │          │
│  │  (Messages DB)   │              │  Busy Users Set    │          │
│  └──────────────────┘              │  Pending Calls Map │          │
│                                    └────────────────────┘          │
└────────────────────────────────────────────────────────────────────┘
          │
          │ WebRTC uses STUN servers for NAT traversal
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STUN Servers (Google)                         │
│  • stun:stun.l.google.com:19302                                 │
│  • stun:stun1.l.google.com:19302                                │
│  • stun:stun2.l.google.com:19302                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Chat System

### Architecture Overview

The chat system uses a hybrid approach:
1. **REST API** for storing and retrieving message history
2. **Socket.IO** for real-time message delivery

### Components

#### Backend Components
- **Message Model** (`Message.model.js`)
  - Stores messages in MongoDB
  - Fields: sender, receiver, text, image, video, audio, file, timestamps
  
- **Message Controller** (`message.controller.js`)
  - `sendMessage()`: Saves message to DB and emits via Socket.IO
  - `getMessages()`: Retrieves message history between two users
  - `deleteMessage()`: Deletes a message and notifies both users

- **Socket.IO Events**
  - Emits: `newMessage`, `deleteMessage`
  - Real-time delivery to sender and receiver rooms

#### Frontend Components
- **SocketContext** (`SocketContext.jsx`)
  - Manages Socket.IO connection
  - Listens for `newMessage` and `deleteMessage` events
  - Maintains messages state array
  
- **ChatPage** (`ChatPage.jsx`)
  - UI for displaying messages
  - Sends messages via REST API
  - Receives real-time updates from SocketContext

### Chat Flow

```
User A                    Server                    User B
  │                         │                         │
  │ 1. Type message         │                         │
  │ 2. POST /api/messages   │                         │
  ├────────────────────────>│                         │
  │                         │ 3. Save to MongoDB      │
  │                         │ 4. Emit 'newMessage'    │
  │<────────────────────────┼────────────────────────>│
  │  Socket.IO              │         Socket.IO       │
  │                         │                         │
  │ 5. Update UI            │                     6. Update UI
  │    (add to messages[])  │                        (add to messages[])
```

### Message Types Supported
- **Text**: Plain text messages
- **Image**: Image files (uploaded to Cloudinary)
- **Video**: Video files (uploaded to Cloudinary)
- **Audio**: Audio recordings (uploaded to Cloudinary)
- **File**: Document attachments (uploaded to Cloudinary)

### Data Flow

1. **Sending a Message**:
   ```
   ChatPage → FormData with media → POST /api/messages
   → Controller saves to DB → Emits via Socket.IO
   → Both users receive via WebSocket → UI updates
   ```

2. **Loading Message History**:
   ```
   ChatPage → GET /api/messages/:userId
   → Controller fetches from MongoDB
   → Returns sorted messages → Display in UI
   ```

3. **Real-time Message Delivery**:
   ```
   Socket.IO 'newMessage' event → SocketContext listener
   → Updates messages state → ChatPage re-renders
   ```

---

## Voice & Video Call System

### Architecture Overview

The voice and video call system uses **WebRTC** for peer-to-peer media streaming and **Socket.IO** for signaling.

### Key Concepts

#### WebRTC (Web Real-Time Communication)
- Enables peer-to-peer audio/video communication
- Direct media streaming between browsers (no server relay)
- Uses STUN servers for NAT traversal

#### Signaling
- Process of coordinating communication
- Exchanging session information (SDP offers/answers)
- ICE candidate exchange for NAT traversal
- Uses Socket.IO for signaling channel

### Components

#### Backend Components

**Socket.IO Event Handlers** (in `index.js`):
- `callUser`: Initiates a call, sends offer to receiver
- `answerCall`: Responds to call, sends answer to caller
- `rejectCall`: Rejects incoming call
- `endCall`: Terminates active call
- `iceCandidate`: Exchanges ICE candidates for connection setup
- `callBusy`: Notifies when user is busy on another call

**State Management**:
- `onlineUsers`: Map of userId → socketId
- `busyUsers`: Set of users currently in calls
- `pendingCalls`: Queue for offline users

#### Frontend Components

**CallContext** (`CallContext.jsx`):
- Manages call state and WebRTC peer connections
- Handles ICE servers configuration
- Manages local and remote media streams
- Provides call control functions

**VideoCallUI** (`VideoCallUI.jsx`):
- Displays video streams (local and remote)
- Call controls (mute, video toggle, end call)
- Call status indicators
- Duration timer

**CallButton & CallModal** (`CallButton.jsx`, `CallModal.jsx`):
- UI for initiating calls
- Incoming call notifications
- Call type selection (audio/video)

### WebRTC Connection Establishment Flow

```
Caller (User A)                Server                Callee (User B)
     │                           │                          │
     │ 1. Click call button      │                          │
     │ 2. Get media stream       │                          │
     │    (camera/microphone)    │                          │
     │                           │                          │
     │ 3. Create RTCPeerConnection                          │
     │                           │                          │
     │ 4. Create SDP Offer       │                          │
     │                           │                          │
     │ 5. 'callUser' event       │                          │
     ├──────────────────────────>│                          │
     │                           │ 6. Forward 'incomingCall'│
     │                           ├─────────────────────────>│
     │                           │                          │
     │                           │         7. User accepts  │
     │                           │         8. Get media     │
     │                           │         9. Create Peer   │
     │                           │        10. Create Answer │
     │                           │                          │
     │                           │    11. 'answerCall' event│
     │                           │<─────────────────────────┤
     │  12. Forward 'callAccepted'│                         │
     │<──────────────────────────┤                          │
     │                           │                          │
     │ 13. Set remote description│     14. Set remote desc  │
     │                           │                          │
     │ 15. Exchange ICE candidates                          │
     │<──────────────────────────┼─────────────────────────>│
     │                           │                          │
     │ 16. WebRTC P2P Connection Established               │
     │<════════════════════════════════════════════════════>│
     │         Direct media streaming (audio/video)         │
```

### Call States

| State | Description |
|-------|-------------|
| `idle` | No call active |
| `calling` | Outgoing call initiated, waiting for answer |
| `ringing` | Incoming call received, not yet answered |
| `connecting` | Call accepted, establishing connection |
| `connected` | Call active, media streaming |
| `ended` | Call terminated |

### Media Constraints

#### Desktop
```javascript
{
  audio: true,
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: "user"
  }
}
```

#### Mobile (Optimized)
```javascript
{
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  },
  video: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    facingMode: "user"
  }
}
```

### ICE Servers Configuration

```javascript
{
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" }
  ]
}
```

---

## Real-time Communication Flow

### Socket.IO Connection Lifecycle

#### 1. Connection Establishment
```javascript
// Frontend connects with userId
const socket = io(socketUrl, {
  query: { userId: user._id },
  withCredentials: true,
  transports: ["websocket", "polling"]
});
```

#### 2. User Registration
```javascript
// User joins their personal room
socket.emit("addUser", userId);
socket.emit("joinRoom", userId);

// Server tracks online users
onlineUsers.set(userId, socketId);
io.emit("onlineUsers", Array.from(onlineUsers.keys()));
```

#### 3. Event Listeners Setup
```javascript
// Chat events
socket.on("newMessage", handleNewMessage);
socket.on("deleteMessage", handleDeleteMessage);

// Call events
socket.on("incomingCall", handleIncomingCall);
socket.on("callAccepted", handleCallAccepted);
socket.on("callEnded", handleCallEnded);
socket.on("iceCandidate", handleIceCandidate);
```

#### 4. Disconnection Handling
```javascript
// Server detects disconnect
socket.on("disconnect", () => {
  onlineUsers.delete(userId);
  busyUsers.delete(userId);
  io.emit("userDisconnected", userId);
  io.emit("onlineUsers", Array.from(onlineUsers.keys()));
});
```

---

## WebRTC Implementation

### RTCPeerConnection Lifecycle

#### 1. Create Peer Connection
```javascript
peerConnection = new RTCPeerConnection(ICE_SERVERS);
```

#### 2. Add Local Media Tracks
```javascript
localStream.getTracks().forEach(track => {
  peerConnection.addTrack(track, localStream);
});
```

#### 3. Handle Remote Tracks
```javascript
peerConnection.ontrack = (event) => {
  setRemoteStream(event.streams[0]);
};
```

#### 4. ICE Candidate Handling
```javascript
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit("iceCandidate", {
      to: remoteUserId,
      candidate: event.candidate
    });
  }
};
```

#### 5. Connection State Monitoring
```javascript
peerConnection.onconnectionstatechange = () => {
  console.log("State:", peerConnection.connectionState);
  if (peerConnection.connectionState === "connected") {
    setCallActive(true);
  } else if (peerConnection.connectionState === "failed") {
    endCall();
  }
};
```

### SDP Offer/Answer Exchange

#### Caller Flow
```javascript
// 1. Create offer
const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);

// 2. Send offer to callee
socket.emit("callUser", { to: calleeId, offer });

// 3. Receive answer
socket.on("callAccepted", async ({ answer }) => {
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(answer)
  );
});
```

#### Callee Flow
```javascript
// 1. Receive offer
socket.on("incomingCall", async ({ from, offer }) => {
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(offer)
  );

  // 2. Create answer
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  // 3. Send answer to caller
  socket.emit("answerCall", { to: from, answer });
});
```

---

## Socket.IO Events Reference

### Chat Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `newMessage` | Server → Client | `{ sender, receiver, text, image, video, audio, file }` | New message received |
| `deleteMessage` | Server → Client | `messageId` | Message deleted by sender |

### Call Signaling Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `callUser` | Client → Server | `{ to, offer, callType, callerName, callerAvatar }` | Initiate call |
| `incomingCall` | Server → Client | `{ from, offer, callType, callerName, callerAvatar }` | Receive incoming call |
| `answerCall` | Client → Server | `{ to, answer }` | Accept call |
| `callAccepted` | Server → Client | `{ answer }` | Call was accepted |
| `rejectCall` | Client → Server | `{ to }` | Reject call |
| `callRejected` | Server → Client | - | Call was rejected |
| `endCall` | Client → Server | `{ to }` | End active call |
| `callEnded` | Server → Client | - | Call ended by peer |
| `iceCandidate` | Bidirectional | `{ to, candidate }` | Exchange ICE candidates |
| `callBusy` | Server → Client | - | User is on another call |
| `callQueued` | Server → Client | `{ message }` | User offline, call queued |

### User Presence Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `addUser` | Client → Server | `userId` | Register user connection |
| `joinRoom` | Client → Server | `userId` | Join personal room |
| `onlineUsers` | Server → Client | `[userId1, userId2, ...]` | List of online users |
| `userDisconnected` | Server → Client | `userId` | User went offline |

---

## Data Models

### Message Model

```javascript
{
  sender: ObjectId,      // Reference to User
  receiver: ObjectId,    // Reference to User
  text: String,          // Text content (optional)
  image: String,         // Cloudinary URL (optional)
  video: String,         // Cloudinary URL (optional)
  audio: String,         // Cloudinary URL (optional)
  file: String,          // Cloudinary URL (optional)
  createdAt: Date,       // Auto-generated
  updatedAt: Date        // Auto-generated
}
```

### Call State (Frontend Only)

```javascript
{
  incomingCall: {
    from: String,        // User ID
    offer: RTCSessionDescription,
    callType: 'video' | 'audio',
    callerName: String,
    callerAvatar: String
  },
  callActive: Boolean,
  callType: 'video' | 'audio' | null,
  callStatus: 'idle' | 'calling' | 'ringing' | 'connecting' | 'connected' | 'ended',
  isCaller: Boolean,
  remoteUserId: String,
  localStream: MediaStream | null,
  remoteStream: MediaStream | null,
  isMuted: Boolean,
  isVideoOff: Boolean
}
```

---

## Key Components

### Frontend Context Providers

#### SocketContext
- **Purpose**: Manages Socket.IO connection and real-time events
- **State**: `socket`, `messages`, `notifications`, `onlineUsers`
- **Key Functions**: Connection management, event listeners

#### CallContext
- **Purpose**: Manages WebRTC calls and media streams
- **State**: Call state, streams, peer connection
- **Key Functions**: `startCall()`, `acceptCall()`, `endCall()`, `toggleMute()`, `toggleVideo()`

#### AppContext
- **Purpose**: Global application state
- **State**: `user`, `posts`, `requests`, etc.

### Frontend UI Components

#### ChatPage
- Displays conversation with selected user
- Sends messages via REST API
- Real-time update from SocketContext
- Supports text and multimedia messages

#### VideoCallUI
- Full-screen call interface
- Displays local and remote video streams
- Call controls (mute, video toggle, end)
- Call duration timer

#### CallModal
- Incoming call notification
- Call accept/reject interface
- Caller information display

### Backend Controllers

#### message.controller.js
- `sendMessage()`: Store message and emit to clients
- `getMessages()`: Retrieve chat history
- `deleteMessage()`: Remove message and notify

### Backend Route Handlers

#### message.route.js
- `POST /api/messages`: Send new message
- `GET /api/messages/:userId`: Get conversation history
- `DELETE /api/messages/:messageId`: Delete message

---

## Sequence Diagrams

### 1. Sending a Chat Message

```
   User A                ChatPage            Server              Database          User B
     │                      │                   │                   │                 │
     │ Type message         │                   │                   │                 │
     ├─────────────────────>│                   │                   │                 │
     │                      │ POST /api/messages│                   │                 │
     │                      ├──────────────────>│                   │                 │
     │                      │                   │ Save message      │                 │
     │                      │                   ├──────────────────>│                 │
     │                      │                   │<──────────────────┤                 │
     │                      │                   │                   │                 │
     │                      │                   │ Emit 'newMessage' via Socket.IO    │
     │                      │<──────────────────┤───────────────────────────────────>│
     │ UI Update            │                   │                   │     UI Update   │
     │<─────────────────────┤                   │                   │                 │
```

### 2. Video Call Establishment

```
Caller (A)           CallContext         Server          CallContext       Callee (B)
   │                     │                  │                 │                 │
   │ Click "Video Call"  │                  │                 │                 │
   ├────────────────────>│                  │                 │                 │
   │                     │ Get media stream │                 │                 │
   │                     │ (camera + mic)   │                 │                 │
   │                     │                  │                 │                 │
   │                     │ Create Peer Conn │                 │                 │
   │                     │ Create SDP Offer │                 │                 │
   │                     │                  │                 │                 │
   │                     │ callUser event  │                 │                 │
   │                     ├─────────────────>│                 │                 │
   │                     │                  │ incomingCall    │                 │
   │                     │                  ├────────────────>│                 │
   │                     │                  │                 │ Show modal      │
   │                     │                  │                 ├────────────────>│
   │                     │                  │                 │ Accept call     │
   │                     │                  │                 │<────────────────┤
   │                     │                  │                 │ Get media       │
   │                     │                  │                 │ Create Peer     │
   │                     │                  │                 │ Set remote SDP  │
   │                     │                  │                 │ Create Answer   │
   │                     │                  │                 │                 │
   │                     │                  │ answerCall event│                 │
   │                     │                  │<────────────────┤                 │
   │                     │ callAccepted     │                 │                 │
   │                     │<─────────────────┤                 │                 │
   │                     │ Set remote SDP   │                 │                 │
   │                     │                  │                 │                 │
   │                     │ ─ ─ ─ ─ ─  ICE Candidates  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
   │                     │<════════════════════════════════════════════════════>│
   │                     │                  │                 │                 │
   │                     │ ═══════════ WebRTC P2P Media Stream ═══════════════>│
   │ Video streaming     │                  │                 │  Video streaming│
   │<───────────────────>│                  │                 │<───────────────>│
```

### 3. Handling Offline User Call

```
   Caller           Server              Callee (Offline)
     │                 │                       │
     │ callUser        │                       │
     ├────────────────>│                       X (offline)
     │                 │ Check onlineUsers    
     │                 │ User not found       
     │                 │ Add to pendingCalls  
     │                 │                       
     │ callQueued      │                       
     │<────────────────┤                       
     │ Alert shown     │                       
     │                 │                       │
     │                 │    [Later: User comes online]
     │                 │                       │
     │                 │<──────────────────────┤ connect
     │                 │ addUser event         │
     │                 │ Check pendingCalls    │
     │                 │ incomingCall          │
     │                 ├──────────────────────>│
     │                 │                       │ Show notification
```

### 4. Call Rejection Flow

```
   Caller           Server           Callee
     │                 │                │
     │ callUser        │                │
     ├────────────────>│ incomingCall   │
     │                 ├───────────────>│
     │                 │                │ Click "Reject"
     │                 │ rejectCall     │
     │                 │<───────────────┤
     │ callRejected    │                │
     │<────────────────┤                │
     │ Alert + cleanup │                │
```

### 5. Active Call End Flow

```
   User A           Server           User B
     │                │                 │
     │ [Call active]  │  [Call active]  │
     │                │                 │
     │ Click "End"    │                 │
     ├───────────────>│                 │
     │ endCall event  │                 │
     │                │ callEnded       │
     │                ├────────────────>│
     │ Cleanup:       │                 │ Cleanup:
     │ - Stop tracks  │                 │ - Stop tracks
     │ - Close peer   │                 │ - Close peer
     │ - Reset state  │                 │ - Reset state
```

---

## Technical Considerations

### Security
- JWT authentication for API calls
- Credentials included in Socket.IO connections
- CORS configuration for trusted origins
- User validation before emitting events

### Scalability Considerations
- **Current**: Single server with in-memory user tracking
- **Future Improvements**:
  - Redis for distributed user sessions
  - TURN servers for NAT traversal in restricted networks
  - Message queueing for high traffic
  - Database connection pooling

### Error Handling
- Try-catch blocks in all async operations
- WebRTC connection state monitoring
- Automatic cleanup on failures
- User-friendly error messages

### Mobile Optimizations
- Reduced video resolution (640x480)
- Enhanced audio processing
  - Echo cancellation
  - Noise suppression
  - Auto gain control
- `playsinline` attribute for iOS compatibility
- Touch event handling for autoplay

### Browser Compatibility
- WebRTC supported in modern browsers
- Fallback transports (WebSocket → Polling)
- getUserMedia API with proper error handling

---

## Future Enhancements

### Planned Features
1. **Group Calls**: Multi-party video conferencing
2. **Screen Sharing**: Share screen during calls
3. **Message Reactions**: Emoji reactions to messages
4. **Typing Indicators**: Real-time typing status
5. **Message Read Receipts**: Track message read status
6. **Call Recording**: Record video calls (with consent)
7. **File Transfer Progress**: Progress bar for large files
8. **End-to-End Encryption**: Secure message content

### Infrastructure Improvements
1. **Clustering**: Multiple server instances
2. **Redis Adapter**: Distributed Socket.IO
3. **CDN Integration**: Faster media delivery
4. **Load Balancing**: Distribute user connections
5. **TURN Servers**: Better NAT traversal
6. **Monitoring**: Real-time system health tracking

---

## Development Guidelines

### Adding New Socket Events

1. **Define event on server** (backend/src/index.js)
2. **Emit event** from appropriate controller
3. **Listen to event** in SocketContext (frontend)
4. **Update UI** based on event data

### Extending Call Features

1. **Update CallContext** with new state/functions
2. **Emit Socket.IO** signaling events if needed
3. **Update VideoCallUI** for UI changes
4. **Test on multiple** devices/browsers

### Testing Checklist

- [ ] Message delivery (online users)
- [ ] Message persistence (offline users)
- [ ] Video call establishment
- [ ] Audio call establishment
- [ ] Call rejection handling
- [ ] Call end cleanup
- [ ] Network interruption recovery
- [ ] Multiple browser testing
- [ ] Mobile device testing
- [ ] Media permission handling

---

## Conclusion

LingoLive's architecture leverages modern web technologies to provide real-time communication features. The combination of REST APIs for persistence, Socket.IO for signaling, and WebRTC for media streaming creates a robust and scalable platform.

Key architectural strengths:
✅ **Separation of concerns**: Clear division between signaling and media
✅ **Real-time updates**: Instant message and call notifications
✅ **Peer-to-peer efficiency**: Direct media streaming reduces server load
✅ **Mobile-optimized**: Adaptive constraints and compatibility fixes
✅ **Extensible design**: Easy to add new features

For detailed implementation, refer to the source code in:
- Backend: `/backend/src/`
- Frontend: `/frontend/src/`

---

**Document Version**: 1.0  
**Last Updated**: March 3, 2026  
**Maintained By**: LingoLive Development Team
