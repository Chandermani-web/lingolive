import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSocket } from "./SocketContext";
import AppContext from "./UseContext";

const CallContext = createContext();

// ICE servers for WebRTC connection - with multiple TURN servers for reliability
const ICE_SERVERS = {
  iceServers: [
    // STUN servers
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    // TURN servers for long-distance/firewall traversal
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
  iceCandidatePoolSize: 10,
};

// Media constraints for better compatibility
const getMediaConstraints = (type, isMobile) => {
  const constraints = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 48000,
      channelCount: 1,
    }
  };
  
  if (type === "video") {
    constraints.video = {
      width: { ideal: isMobile ? 640 : 1280 },
      height: { ideal: isMobile ? 480 : 720 },
      facingMode: "user",
      frameRate: { ideal: isMobile ? 24 : 30 },
    };
  } else {
    constraints.video = false;
  }
  
  return constraints;
};

// Detect if device is mobile
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const CallProvider = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useContext(AppContext);

  // Call states
  const [incomingCall, setIncomingCall] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState(null); // 'video' or 'audio'
  const [isCaller, setIsCaller] = useState(false);
  const [remoteUserId, setRemoteUserId] = useState(null);
  const [callStatus, setCallStatus] = useState("idle"); // idle, calling, ringing, connected, ended
  
  // Media states
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  // Refs
  const peerConnectionRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const isMobile = useRef(isMobileDevice());

  // Start a call
  // Note: targetUserName and targetUserAvatar kept for future use (e.g., showing "Calling John...")
  const startCall = async (targetUserId, type, _targetUserName, _targetUserAvatar) => {
    try {
      setCallStatus("calling");
      setCallType(type);
      setIsCaller(true);
      setRemoteUserId(targetUserId);

      // Get user media with mobile-optimized constraints
      const constraints = getMediaConstraints(type, isMobile.current);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      setLocalStream(stream);

      // Note: targetUserName and targetUserAvatar are sent to the server for the receiving user

      // Note: targetUserName and targetUserAvatar are sent to the server for the receiving user

      // Create peer connection
      peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS);

      // Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        console.log("📹 Received remote track");
        setRemoteStream(event.streams[0]);
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("🧊 Sending ICE candidate");
          socket.emit("iceCandidate", {
            to: targetUserId,
            candidate: event.candidate,
          });
        }
      };

      // Monitor connection state - with reconnection attempts
      let disconnectTimeout;
      peerConnectionRef.current.onconnectionstatechange = () => {
        console.log("Connection state:", peerConnectionRef.current.connectionState);
        if (peerConnectionRef.current.connectionState === "connected") {
          setCallStatus("connected");
          setCallActive(true);
          if (disconnectTimeout) {
            clearTimeout(disconnectTimeout);
            disconnectTimeout = null;
          }
        } else if (peerConnectionRef.current.connectionState === "disconnected") {
          // Give it 10 seconds to reconnect before ending call
          console.log("⚠️ Temporarily disconnected, attempting to reconnect...");
          disconnectTimeout = setTimeout(() => {
            console.log("❌ Reconnection failed, ending call");
            endCall();
          }, 10000);
        } else if (peerConnectionRef.current.connectionState === "failed") {
          // Connection failed - end immediately
          console.log("❌ Connection failed");
          endCall();
        }
      };

      // Monitor ICE connection state
      peerConnectionRef.current.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", peerConnectionRef.current.iceConnectionState);
        if (peerConnectionRef.current.iceConnectionState === "failed") {
          console.log("🔄 ICE failed, attempting restart");
          // Try ICE restart
          peerConnectionRef.current.restartIce();
        }
      };

      // Create and send offer
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      socket.emit("callUser", {
        to: targetUserId,
        offer,
        callType: type,
        callerName: user?.name || "Unknown",
        callerAvatar: user?.avatar || "",
      });

    } catch (error) {
      console.error("❌ Error starting call:", error);
      setCallStatus("idle");
      alert("Failed to start call. Please check camera/microphone permissions.");
    }
  };

  // Accept incoming call
  const acceptCall = async () => {
    try {
      if (!incomingCall) return;

      setCallStatus("connecting");
      setCallType(incomingCall.callType);
      setIsCaller(false);
      setRemoteUserId(incomingCall.from);

      // Get user media with mobile-optimized constraints
      const constraints = getMediaConstraints(incomingCall.callType, isMobile.current);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      setLocalStream(stream);

      // Create peer connection
      peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS);

      // Add tracks
      stream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        console.log("📹 Received remote track");
        setRemoteStream(event.streams[0]);
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("🧊 Sending ICE candidate");
          socket.emit("iceCandidate", {
            to: incomingCall.from,
            candidate: event.candidate,
          });
        }
      };

      // Monitor connection state - with reconnection attempts
      let disconnectTimeout;
      peerConnectionRef.current.onconnectionstatechange = () => {
        console.log("Connection state:", peerConnectionRef.current.connectionState);
        if (peerConnectionRef.current.connectionState === "connected") {
          setCallStatus("connected");
          setCallActive(true);
          if (disconnectTimeout) {
            clearTimeout(disconnectTimeout);
            disconnectTimeout = null;
          }
        } else if (peerConnectionRef.current.connectionState === "disconnected") {
          // Give it 10 seconds to reconnect before ending call
          console.log("⚠️ Temporarily disconnected, attempting to reconnect...");
          disconnectTimeout = setTimeout(() => {
            console.log("❌ Reconnection failed, ending call");
            endCall();
          }, 10000);
        } else if (peerConnectionRef.current.connectionState === "failed") {
          // Connection failed - end immediately
          console.log("❌ Connection failed");
          endCall();
        }
      };

      // Monitor ICE connection state
      peerConnectionRef.current.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", peerConnectionRef.current.iceConnectionState);
        if (peerConnectionRef.current.iceConnectionState === "failed") {
          console.log("🔄 ICE failed, attempting restart");
          // Try ICE restart
          peerConnectionRef.current.restartIce();
        }
      };

      // Set remote description
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      );

      // Add any pending ICE candidates
      for (const candidate of pendingCandidatesRef.current) {
        await peerConnectionRef.current.addIceCandidate(candidate);
      }
      pendingCandidatesRef.current = [];

      // Create and send answer
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      socket.emit("answerCall", {
        to: incomingCall.from,
        answer,
      });

      setIncomingCall(null);
    } catch (error) {
      console.error("❌ Error accepting call:", error);
      rejectCall();
      alert("Failed to accept call. Please check camera/microphone permissions.");
    }
  };

  // Reject incoming call
  const rejectCall = () => {
    if (incomingCall) {
      socket.emit("rejectCall", {
        to: incomingCall.from,
      });
      setIncomingCall(null);
    }
  };

  // End call
  const endCall = () => {
    console.log("📵 Ending call");

    // Notify remote user
    if (remoteUserId) {
      socket.emit("endCall", { to: remoteUserId });
    }

    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Reset state
    setLocalStream(null);
    setRemoteStream(null);
    setCallActive(false);
    setCallStatus("idle");
    setCallType(null);
    setIsCaller(false);
    setRemoteUserId(null);
    setIsMuted(false);
    setIsVideoOff(false);
    pendingCandidatesRef.current = [];
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Incoming call
    socket.on("incomingCall", ({ from, offer, callType, callerName, callerAvatar }) => {
      console.log("📞 Incoming call from:", from);
      
      // If already in a call, send busy signal
      if (callActive || incomingCall) {
        socket.emit("callBusy", { to: from });
        return;
      }

      setIncomingCall({ from, offer, callType, callerName, callerAvatar });
      setCallStatus("ringing");
    });

    // Call accepted
    socket.on("callAccepted", async ({ answer }) => {
      console.log("✅ Call accepted");
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );

          // Add any pending ICE candidates
          for (const candidate of pendingCandidatesRef.current) {
            await peerConnectionRef.current.addIceCandidate(candidate);
          }
          pendingCandidatesRef.current = [];
        }
      } catch (error) {
        console.error("Error setting remote description:", error);
      }
    });

    // Call rejected
    socket.on("callRejected", () => {
      console.log("❌ Call rejected");
      alert("Call was rejected");
      endCall();
    });

    // Call ended
    socket.on("callEnded", () => {
      console.log("📵 Call ended by remote user");
      endCall();
    });

    // ICE candidate
    socket.on("iceCandidate", async ({ candidate }) => {
      console.log("🧊 Received ICE candidate");
      try {
        if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          // Store for later if remote description not set yet
          pendingCandidatesRef.current.push(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    });

    // Call busy
    socket.on("callBusy", () => {
      alert("User is busy on another call");
      endCall();
    });

    // User disconnected
    socket.on("userDisconnected", (userId) => {
      if (userId === remoteUserId && callActive) {
        alert("User disconnected");
        endCall();
      }
    });

    // Call failed
    socket.on("callFailed", ({ message }) => {
      console.log("❌ Call failed:", message);
      setCallStatus("idle");
      // Don't alert for offline - show callQueued message instead
    });

    // Call queued (user offline)
    socket.on("callQueued", ({ message }) => {
      console.log("📭 Call queued:", message);
      alert(message);
      setCallStatus("idle");
      setCallType(null);
      setIsCaller(false);
      setRemoteUserId(null);
      
      // Stop local stream if started
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
    });

    return () => {
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("callRejected");
      socket.off("callEnded");
      socket.off("iceCandidate");
      socket.off("callBusy");
      socket.off("userDisconnected");
      socket.off("callFailed");
      socket.off("callQueued");
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, callActive, incomingCall, remoteUserId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CallContext.Provider
      value={{
        // State
        incomingCall,
        callActive,
        callType,
        callStatus,
        isCaller,
        remoteUserId,
        localStream,
        remoteStream,
        isMuted,
        isVideoOff,
        
        // Actions
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleVideo,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);