# Socket Event Flow Diagrams

## Complete Call Flow (Success Case)

```mermaid
sequenceDiagram
    participant UA as User A (Caller)
    participant FA as Frontend A
    participant BE as Backend
    participant FB as Frontend B
    participant UB as User B (Receiver)

    Note over UA,UB: 1. CALL INITIATION
    UA->>FA: Click "Video Call"
    FA->>FA: startCall()
    FA->>FA: getUserMedia()
    FA->>FA: createPeerConnection()
    FA->>FA: createOffer()
    FA->>BE: callUser { offer, to: B }
    BE->>BE: createSession(A, B)
    BE->>BE: Check if B busy (✅ free)
    BE->>BE: Store offer
    BE->>FB: incomingCall { from: A, offer }
    FB->>UB: Show incoming call modal

    Note over UA,UB: 2. CALL ACCEPTANCE
    UB->>FB: Click "Accept"
    FB->>FB: acceptCall()
    FB->>FB: getUserMedia()
    FB->>FB: createPeerConnection()
    FB->>FB: setRemoteDescription(offer)
    FB->>FB: createAnswer()
    FB->>BE: answerCall { sessionId, answer }
    BE->>BE: Store answer
    BE->>BE: Mark CONNECTING
    BE->>FA: callAccepted { answer }
    FA->>FA: setRemoteDescription(answer)

    Note over UA,UB: 3. ICE CANDIDATE EXCHANGE
    FA->>BE: iceCandidate { candidate }
    BE->>FB: iceCandidate { candidate }
    FB->>FB: addIceCandidate()
    
    FB->>BE: iceCandidate { candidate }
    BE->>FA: iceCandidate { candidate }
    FA->>FA: addIceCandidate()

    Note over UA,UB: 4. WebRTC CONNECTION
    FA-->>FB: Direct P2P Connection Established
    FA->>BE: callConnected
    FB->>BE: callConnected
    BE->>BE: Mark CONNECTED
    
    Note over UA,UB: 5. ACTIVE CALL
    FA-->>FB: Audio/Video Stream (P2P)
    
    Note over UA,UB: 6. CALL END
    UA->>FA: Click "End Call"
    FA->>BE: endCall { sessionId }
    BE->>BE: endSession()
    BE->>FB: callEnded
    FB->>UB: Show "Call ended"
```

## Race Condition Resolution

```mermaid
sequenceDiagram
    participant UA as User A
    participant FA as Frontend A
    participant BE as Backend
    participant FB as Frontend B
    participant UB as User B

    Note over UA,UB: Both users call each other simultaneously!
    
    UA->>FA: Call B
    UB->>FB: Call A
    
    par Simultaneous Calls
        FA->>BE: callUser { to: B }
        FB->>BE: callUser { to: A }
    end

    BE->>BE: Check race condition
    BE->>BE: Compare IDs: A < B
    BE->>BE: A's call wins!
    BE->>BE: Cancel B's outgoing call
    
    BE->>FB: callFailed { reason: "SIMULTANEOUS_CALL" }
    BE->>FB: incomingCall { from: A }
    
    FB->>UB: Cancel outgoing call
    FB->>UB: Show incoming call from A
    
    Note over UA,UB: ✅ Only one call proceeds
```

## Call Recovery After Refresh

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant BE as Backend
    participant P as Peer

    Note over U,P: 1. User in active call
    F-->>P: Audio/Video Streaming
    
    Note over U,P: 2. User refreshes page
    U->>F: Refresh browser
    F->>F: Page unloads
    F-xBE: Socket disconnects
    
    Note over U,P: 3. Page reloads
    F->>F: App initializes
    F->>BE: Socket reconnects
    
    Note over U,P: 4. Session recovery
    F->>BE: recoverSession
    BE->>BE: Check active sessions
    BE->>BE: Find session for user
    BE->>F: sessionRecovered { sessionId, offer, answer }
    
    Note over U,P: 5. Restore connection
    F->>F: Restore call state
    F->>F: Recreate peer connection
    F->>F: Apply offer/answer
    F->>F: Request media again
    F-->>P: Resume streaming
    
    Note over U,P: ✅ Call continues
```

## Busy State Handling

```mermaid
sequenceDiagram
    participant UA as User A
    participant FA as Frontend A
    participant BE as Backend
    participant FB as Frontend B
    participant UB as User B
    participant UC as User C
    participant FC as Frontend C

    Note over UA,UB: A and B are in active call
    FA-->>FB: Audio/Video Streaming
    BE->>BE: Session A-B: CONNECTED
    
    Note over UC: C tries to call B
    UC->>FC: Call B
    FC->>BE: callUser { to: B }
    
    BE->>BE: isUserInCall(B)?
    BE->>BE: ✅ Yes, B is in call
    
    BE->>FC: callBusy { message: "User busy" }
    FC->>UC: Show "User is on another call"
    
    Note over UC: ✅ C prevented from interrupting
```

## Call Rejection Flow

```mermaid
sequenceDiagram
    participant UA as User A
    participant FA as Frontend A
    participant BE as Backend
    participant FB as Frontend B
    participant UB as User B

    UA->>FA: Call B
    FA->>BE: callUser { to: B }
    BE->>FB: incomingCall
    FB->>UB: Show incoming call modal
    
    Note over UB: User decides to reject
    UB->>FB: Click "Reject"
    FB->>BE: rejectCall { sessionId }
    
    BE->>BE: Mark session REJECTED
    BE->>BE: endSession()
    
    BE->>FA: callRejected
    FA->>FA: Stop local stream
    FA->>FA: Close connection
    FA->>UA: Show "Call was rejected"
    
    Note over UA,UB: ✅ Clean rejection
```

## Call Timeout (No Answer)

```mermaid
sequenceDiagram
    participant UA as User A
    participant FA as Frontend A
    participant BE as Backend
    participant FB as Frontend B
    participant UB as User B

    UA->>FA: Call B
    FA->>BE: callUser
    BE->>BE: createSession()
    BE->>BE: Set 60s timeout
    BE->>FB: incomingCall
    FB->>UB: Show incoming call
    
    Note over UB: User doesn't respond (60s)
    
    BE->>BE: Timeout triggered
    BE->>BE: endSession(MISSED)
    BE->>BE: Add to call history
    
    BE->>FA: callEnded { reason: "TIMEOUT" }
    FA->>UA: Show "No answer"
    
    Note over UB: Later when B checks
    UB->>FB: Open app
    FB->>BE: getCallHistory
    BE->>FB: callHistory [ missed call from A ]
    FB->>UB: Show missed call notification
```

## Connection Failure Recovery

```mermaid
sequenceDiagram
    participant FA as Frontend A
    participant PC as PeerConnection
    participant FB as Frontend B

    Note over FA,FB: Active call
    FA-->>FB: Audio/Video Streaming
    
    Note over PC: Network interruption
    PC->>PC: State: disconnected
    
    PC->>FA: onconnectionstatechange
    FA->>FA: attemptReconnection()
    FA->>FA: Attempt 1/3
    
    FA->>PC: createOffer({ iceRestart: true })
    FA->>FB: Send new offer
    
    FB->>PC: Apply offer
    FB->>PC: Create answer
    FB->>FA: Send answer
    
    Note over PC: ICE restart
    PC-->>PC: New ICE candidates
    
    alt Recovery Successful
        PC->>PC: State: connected
        FA-->>FB: Resume streaming
        Note over FA,FB: ✅ Call recovered
    else Recovery Failed (after 3 attempts)
        PC->>PC: State: failed
        FA->>FA: handleCallFailure()
        Note over FA,FB: ❌ Call ended
    end
```

## User Offline Scenario

```mermaid
sequenceDiagram
    participant UA as User A
    participant FA as Frontend A
    participant BE as Backend
    participant UB as User B (Offline)

    UA->>FA: Call B
    FA->>BE: callUser { to: B }
    
    BE->>BE: Check if B online
    BE->>BE: ❌ B not in onlineUsers
    
    BE->>FA: callQueued { message: "User offline" }
    FA->>UA: Show "User is offline"
    
    FA->>FA: Stop local stream
    FA->>FA: Clean up
    
    Note over UB: Later, B comes online
    UB->>BE: Connect socket
    BE->>BE: addUser(B)
    
    Note over BE: Could send push notification
    Note over BE: Or store as missed call
```

---

## State Transitions

```mermaid
stateDiagram-v2
    [*] --> IDLE
    
    IDLE --> INITIATING: startCall()
    IDLE --> RINGING: incomingCall
    
    INITIATING --> CALLING: offer sent
    CALLING --> CONNECTING: answer received
    
    RINGING --> CONNECTING: acceptCall()
    RINGING --> IDLE: rejectCall()
    
    CONNECTING --> CONNECTED: WebRTC established
    CONNECTING --> FAILED: connection timeout
    
    CONNECTED --> ENDING: endCall()
    
    ENDING --> ENDED: cleanup complete
    ENDED --> IDLE: reset state
    
    FAILED --> IDLE: reset state
    
    CALLING --> BUSY: receiver busy
    BUSY --> IDLE: reset state
    
    CALLING --> REJECTED: receiver rejects
    REJECTED --> IDLE: reset state
```

---

## Backend Session Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Creating: createSession()
    
    Creating --> INITIATING: session created
    
    INITIATING --> RINGING: offer stored
    
    state timeout_check <<choice>>
    RINGING --> timeout_check: 60s elapsed
    timeout_check --> MISSED: no answer
    
    RINGING --> CONNECTING: acceptCall()
    
    state connect_check <<choice>>
    CONNECTING --> connect_check: 30s elapsed
    connect_check --> FAILED: not connected
    
    CONNECTING --> CONNECTED: callConnected
    
    CONNECTED --> ENDED: endCall()
    
    MISSED --> [*]: cleanup
    FAILED --> [*]: cleanup
    ENDED --> [*]: cleanup
```

---

## Complete Architecture Overview

```mermaid
graph TB
    subgraph "Browser A"
        UA[User A]
        CA[CallContext A]
        WA[WebRTC Helper]
        SA[Socket.IO Client]
    end
    
    subgraph "Backend Server"
        SH[Socket Handler]
        CSM[CallSessionManager]
        MEM[(In-Memory Store)]
        REDIS[(Redis - Optional)]
    end
    
    subgraph "Browser B"
        UB[User B]
        CB[CallContext B]
        WB[WebRTC Helper]
        SB[Socket.IO Client]
    end
    
    UA -->|Click Call| CA
    CA -->|getUserMedia| WA
    CA -->|emit events| SA
    SA <-->|Socket.IO| SH
    SH <-->|Manage Sessions| CSM
    CSM <-->|Store| MEM
    CSM -.->|Production| REDIS
    SH <-->|Socket.IO| SB
    SB -->|emit events| CB
    CB -->|getUserMedia| WB
    CB -->|Show UI| UB
    
    CA -.->|WebRTC P2P| CB
    
    style CSM fill:#4CAF50,color:#fff
    style REDIS fill:#FF9800,color:#fff
    style MEM fill:#2196F3,color:#fff
```

---

These diagrams show:
1. ✅ Complete call flow from start to end
2. ✅ Race condition resolution
3. ✅ Call recovery after refresh
4. ✅ Busy state handling
5. ✅ Rejection flow
6. ✅ Timeout handling
7. ✅ Connection recovery
8. ✅ Offline user handling
9. ✅ State machines
10. ✅ Architecture overview

You can view these diagrams using:
- GitHub (renders Mermaid automatically)
- VS Code (with Mermaid extension)
- [Mermaid Live Editor](https://mermaid.live/)
