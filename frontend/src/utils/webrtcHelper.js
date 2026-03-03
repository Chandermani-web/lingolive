/**
 * WebRTC Configuration Helper
 * 
 * Handles WebRTC peer connection creation, ICE configuration,
 * and connection state management with proper error handling.
 */

/**
 * Production-ready ICE servers configuration
 * 
 * For production, add your own TURN servers for better reliability.
 * Free TURN servers may have rate limits and lower reliability.
 */
export const ICE_SERVERS = {
  iceServers: [
    // Google STUN servers
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    
    // Open Relay TURN servers
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
  
  // ICE transport policy
  // "all" - use both STUN and TURN
  // "relay" - force TURN (more reliable but slower)
  iceTransportPolicy: "all",
  
  // Bundle policy for better compatibility
  bundlePolicy: "max-bundle",
  
  // RTC configuration
  rtcpMuxPolicy: "require",
};

/**
 * Detect device type
 */
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Get optimal media constraints based on device and call type
 */
export const getMediaConstraints = (callType, isMobile = isMobileDevice()) => {
  const constraints = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      // Mobile-specific audio enhancements
      ...(isMobile && {
        sampleRate: 48000,
        channelCount: 1,
      }),
    },
  };

  if (callType === "video") {
    constraints.video = {
      width: { ideal: isMobile ? 640 : 1280, max: isMobile ? 720 : 1920 },
      height: { ideal: isMobile ? 480 : 720, max: isMobile ? 960 : 1080 },
      aspectRatio: { ideal: 16 / 9 },
      facingMode: "user",
      frameRate: { ideal: isMobile ? 24 : 30, max: 30 },
    };
  } else {
    constraints.video = false;
  }

  return constraints;
};

/**
 * Get user media with proper error handling
 */
export const getUserMedia = async (callType) => {
  try {
    const constraints = getMediaConstraints(callType);
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    console.log("✅ Got user media:", {
      audio: stream.getAudioTracks().length,
      video: stream.getVideoTracks().length,
    });
    
    return { success: true, stream };
  } catch (error) {
    console.error("❌ getUserMedia error:", error);
    
    let message = "Could not access camera/microphone";
    
    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
      message = "Permission denied. Please allow camera/microphone access.";
    } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
      message = "Camera/microphone not found";
    } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
      message = "Camera/microphone is already in use";
    } else if (error.name === "OverconstrainedError") {
      message = "Camera/microphone does not meet requirements";
    } else if (error.name === "TypeError") {
      message = "Invalid media constraints";
    }
    
    return { success: false, error: message };
  }
};

/**
 * Create RTCPeerConnection with proper event handlers
 */
export const createPeerConnection = ({
  onIceCandidate,
  onTrack,
  onConnectionStateChange,
  onIceConnectionStateChange,
  onSignalingStateChange,
  onNegotiationNeeded,
}) => {
  const peerConnection = new RTCPeerConnection(ICE_SERVERS);

  // ICE candidate handler
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("🧊 ICE candidate generated:", event.candidate.type);
      onIceCandidate?.(event.candidate);
    } else {
      console.log("🧊 ICE gathering complete");
    }
  };

  // Track handler (remote stream)
  peerConnection.ontrack = (event) => {
    console.log("📹 Remote track received:", event.track.kind);
    onTrack?.(event);
  };

  // Connection state monitoring
  peerConnection.onconnectionstatechange = () => {
    const state = peerConnection.connectionState;
    console.log("🔗 Connection state:", state);
    onConnectionStateChange?.(state);
  };

  // ICE connection state monitoring
  peerConnection.oniceconnectionstatechange = () => {
    const state = peerConnection.iceConnectionState;
    console.log("🧊 ICE connection state:", state);
    onIceConnectionStateChange?.(state);
  };

  // Signaling state monitoring
  peerConnection.onsignalingstatechange = () => {
    const state = peerConnection.signalingState;
    console.log("📡 Signaling state:", state);
    onSignalingStateChange?.(state);
  };

  // Negotiation needed (for renegotiation)
  peerConnection.onnegotiationneeded = () => {
    console.log("🔄 Negotiation needed");
    onNegotiationNeeded?.();
  };

  // ICE gathering state
  peerConnection.onicegatheringstatechange = () => {
    console.log("🧊 ICE gathering state:", peerConnection.iceGatheringState);
  };

  return peerConnection;
};

/**
 * Add tracks to peer connection
 */
export const addTracksToConnection = (peerConnection, stream) => {
  const senders = [];
  
  stream.getTracks().forEach((track) => {
    console.log(`➕ Adding ${track.kind} track`);
    const sender = peerConnection.addTrack(track, stream);
    senders.push(sender);
  });
  
  return senders;
};

/**
 * Replace video track (for switching camera)
 */
export const replaceVideoTrack = async (peerConnection, newTrack) => {
  const senders = peerConnection.getSenders();
  const videoSender = senders.find(sender => sender.track?.kind === "video");
  
  if (videoSender) {
    await videoSender.replaceTrack(newTrack);
    console.log("📹 Video track replaced");
    return true;
  }
  
  return false;
};

/**
 * Stop all tracks in a stream
 */
export const stopStreamTracks = (stream) => {
  if (!stream) return;
  
  stream.getTracks().forEach((track) => {
    track.stop();
    console.log(`⏹️ Stopped ${track.kind} track`);
  });
};

/**
 * Check WebRTC support
 */
export const checkWebRTCSupport = () => {
  const hasGetUserMedia = !!(
    navigator.mediaDevices && navigator.mediaDevices.getUserMedia
  );
  const hasRTCPeerConnection = !!window.RTCPeerConnection;
  
  return {
    supported: hasGetUserMedia && hasRTCPeerConnection,
    hasGetUserMedia,
    hasRTCPeerConnection,
  };
};

/**
 * Get connection quality metrics
 */
export const getConnectionStats = async (peerConnection) => {
  try {
    const stats = await peerConnection.getStats();
    const report = {
      audio: { packetsLost: 0, bytesSent: 0, bytesReceived: 0 },
      video: { packetsLost: 0, bytesSent: 0, bytesReceived: 0 },
    };

    stats.forEach((stat) => {
      if (stat.type === "inbound-rtp") {
        const kind = stat.kind || stat.mediaType;
        if (kind === "audio" || kind === "video") {
          report[kind].packetsLost += stat.packetsLost || 0;
          report[kind].bytesReceived += stat.bytesReceived || 0;
        }
      } else if (stat.type === "outbound-rtp") {
        const kind = stat.kind || stat.mediaType;
        if (kind === "audio" || kind === "video") {
          report[kind].bytesSent += stat.bytesSent || 0;
        }
      }
    });

    return report;
  } catch (error) {
    console.error("Error getting stats:", error);
    return null;
  }
};

/**
 * Monitor connection health
 */
export const monitorConnection = (peerConnection, interval = 5000) => {
  const monitorId = setInterval(async () => {
    const state = peerConnection.connectionState;
    
    if (state === "connected") {
      const stats = await getConnectionStats(peerConnection);
      console.log("📊 Connection stats:", stats);
    } else if (state === "disconnected" || state === "failed") {
      console.warn("⚠️ Connection issues detected:", state);
      clearInterval(monitorId);
    }
  }, interval);

  return () => clearInterval(monitorId);
};

/**
 * Debugging: Log all ICE candidates
 */
export const logIceCandidates = (peerConnection) => {
  peerConnection.addEventListener("icecandidate", (event) => {
    if (event.candidate) {
      console.log("ICE Candidate:", {
        type: event.candidate.type,
        protocol: event.candidate.protocol,
        address: event.candidate.address,
        port: event.candidate.port,
      });
    }
  });
};
