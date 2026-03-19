import { useEffect, useRef, useState } from "react";
import { useCall } from "../../Context/CallContext";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Maximize2,
  User,
} from "lucide-react";

const VideoCallUI = () => {
  const {
    callActive,
    callType,
    callStatus,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    endCall,
    toggleMute,
    toggleVideo,
    remoteUserId: _remoteUserId,
  } = useCall();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null); // For audio-only calls
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const callStartTimeRef = useRef(null);

  // Set up local video stream with mobile autoplay handling
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;

      // Mobile autoplay handling
      const playPromise = localVideoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Local video autoplay prevented:", error);
          // Try to play on user interaction
          document.addEventListener(
            "touchstart",
            () => {
              localVideoRef.current?.play();
            },
            { once: true },
          );
        });
      }
    }
  }, [localStream]);

  // Set up remote video stream
  // Set up remote video stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream && callType === "video") {
      remoteVideoRef.current.srcObject = remoteStream;

      remoteVideoRef.current.setAttribute("playsinline", "");
      remoteVideoRef.current.setAttribute("webkit-playsinline", "");

      const videoElement = remoteVideoRef.current;

      const playVideo = async () => {
        try {
          await videoElement.play();
          console.log("✅ Remote video playing");
        } catch (err) {
          console.log("Play interrupted:", err.message);
        }
      };

      playVideo();
    }
  }, [remoteStream, callType]);

  // Set up remote audio stream for audio-only calls
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      console.log("🔊 Setting up remote audio stream");
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.volume = 1.0; // Maximum volume

      const playPromise = remoteAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("✅ Remote audio playing successfully");
          })
          .catch((error) => {
            console.error("❌ Remote audio autoplay prevented:", error);
            // Try to play on user interaction
            const tryPlay = () => {
              remoteAudioRef.current
                ?.play()
                .then(() =>
                  console.log("✅ Remote audio started after interaction"),
                )
                .catch((e) => console.error("❌ Still failed:", e));
            };
            document.addEventListener("touchstart", tryPlay, { once: true });
            document.addEventListener("click", tryPlay, { once: true });
          });
      }
    }
  }, [remoteStream]);

  // Call duration timer
  useEffect(() => {
    if (callStatus === "connected" && !callStartTimeRef.current) {
      callStartTimeRef.current = Date.now();
    }

    if (callStatus === "connected") {
      const interval = setInterval(() => {
        if (callStartTimeRef.current) {
          const elapsed = Math.floor(
            (Date.now() - callStartTimeRef.current) / 1000,
          );
          setCallDuration(elapsed);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      callStartTimeRef.current = null;
      setCallDuration(0);
    }
  }, [callStatus]);

  // Format call duration
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!callActive && callStatus === "idle") return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-[var(--color-primary)] flex flex-col ${
        isFullscreen ? "p-0" : "p-0"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4 bg-[var(--color-secondary)]/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-highlight)] flex items-center justify-center">
            <User className="w-4 h-4 md:w-6 md:h-6 text-[var(--color-text)]" />
          </div>
          <div>
            <h3 className="text-[var(--color-text)] font-semibold text-sm md:text-base">
              {callType === "video" ? "Video Call" : "Voice Call"}
            </h3>
            <p className="text-[var(--color-muted)] text-xs md:text-sm">
              {callStatus === "connected"
                ? formatDuration(callDuration)
                : callStatus === "calling"
                  ? "Calling..."
                  : callStatus === "ringing"
                    ? "Ringing..."
                    : "Connecting..."}
            </p>
          </div>
        </div>

        <button
          onClick={toggleFullscreen}
          className="p-2 hover:bg-[var(--color-secondary)]/75 rounded-lg transition-colors hidden md:block"
        >
          <Maximize2 className="w-5 h-5 text-[var(--color-muted)]" />
        </button>
      </div>

      {/* Video Container - Mobile Optimized */}
      <div className="flex-1 relative bg-[var(--color-primary)] overflow-hidden">
        {/* Remote Video/Avatar */}
        <div className="absolute inset-0 flex items-center justify-center">
          {remoteStream && callType === "video" ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              webkit-playsinline="true"
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                objectFit: "cover",
                transform: "scale(1.0)",
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-highlight)] flex items-center justify-center mb-4">
                <User className="w-10 h-10 md:w-16 md:h-16 text-[var(--color-text)]" />
              </div>
              <p className="text-[var(--color-text)] text-base md:text-xl font-semibold">
                {callStatus === "connected" ? "On Call" : "Connecting..."}
              </p>
            </div>
          )}

          {/* Connection Status Overlay */}
          {callStatus !== "connected" && (
            <div className="absolute inset-0 bg-[var(--color-primary)]/50 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-[var(--color-text)] border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                <p className="text-[var(--color-text)] text-base md:text-lg">
                  {callStatus === "calling"
                    ? "Calling..."
                    : callStatus === "ringing"
                      ? "Ringing..."
                      : "Connecting..."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Local Video (Picture-in-Picture) - Mobile Optimized */}
        {localStream && callType === "video" && (
          <div className="absolute top-2 right-2 md:top-4 md:right-4 w-20 h-28 md:w-32 md:h-40 bg-[var(--color-secondary)] rounded-lg overflow-hidden shadow-2xl border-2 border-[var(--color-secondary)] z-20">
            {!isVideoOff ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                webkit-playsinline="true"
                muted
                className="w-full h-full transform scale-x-[-1]"
                style={{
                  objectFit: "cover",
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[var(--color-secondary)]">
                <VideoOff className="w-6 h-6 md:w-8 md:h-8 text-[var(--color-muted)]" />
              </div>
            )}
          </div>
        )}

        {/* Audio Call Local Avatar */}
        {localStream && callType === "audio" && (
          <div className="absolute bottom-32 md:bottom-24 left-1/2 transform -translate-x-1/2">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-teal-600 flex items-center justify-center">
              <User className="w-8 h-8 md:w-12 md:h-12 text-[var(--color-text)]" />
            </div>
          </div>
        )}

        {/* Hidden Audio Element for Remote Audio Stream */}
        <audio
          ref={remoteAudioRef}
          autoPlay
          playsInline
          style={{ display: "none" }}
        />
      </div>

      {/* Controls - Mobile Optimized */}
      <div className="p-3 md:p-6 bg-[var(--color-secondary)]/80 backdrop-blur-sm safe-area-bottom">
        <div className="flex items-center justify-center gap-3 md:gap-4 max-w-md mx-auto">
          {/* Mute/Unmute */}
          <button
            onClick={toggleMute}
            className={`p-3 md:p-4 rounded-full transition-all touch-manipulation ${
              isMuted
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[var(--color-secondary)]/75 hover:bg-[var(--color-secondary)]/60"
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <MicOff className="w-5 h-5 md:w-6 md:h-6 text-[var(--color-text)]" />
            ) : (
              <Mic className="w-5 h-5 md:w-6 md:h-6 text-[var(--color-text)]" />
            )}
          </button>

          {/* End Call */}
          <button
            onClick={endCall}
            className="p-4 md:p-5 rounded-full bg-red-600 hover:bg-red-700 transition-all transform hover:scale-105 active:scale-95 touch-manipulation"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6 md:w-7 md:h-7 text-[var(--color-text)]" />
          </button>

          {/* Video Toggle (only for video calls) */}
          {callType === "video" && (
            <button
              onClick={toggleVideo}
              className={`p-3 md:p-4 rounded-full transition-all touch-manipulation ${
                isVideoOff
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[var(--color-secondary)]/75 hover:bg-[var(--color-secondary)]/60"
              }`}
              title={isVideoOff ? "Turn on camera" : "Turn off camera"}
            >
              {isVideoOff ? (
                <VideoOff className="w-5 h-5 md:w-6 md:h-6 text-[var(--color-text)]" />
              ) : (
                <Video className="w-5 h-5 md:w-6 md:h-6 text-[var(--color-text)]" />
              )}
            </button>
          )}
        </div>

        {/* Call Info - Mobile Friendly */}
        <div className="text-center mt-3 md:mt-4 text-[var(--color-muted)] text-xs md:text-sm">
          {isMuted && <span className="inline-block mr-2">🔇 Muted</span>}
          {isVideoOff && callType === "video" && (
            <span className="inline-block">📷 Camera Off</span>
          )}
        </div>
      </div>

      {/* Safe area for mobile devices */}
      <style jsx>{`
        .safe-area-bottom {
          padding-bottom: max(12px, env(safe-area-inset-bottom));
        }

        .touch-manipulation {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        @supports (-webkit-touch-callout: none) {
          /* iOS specific styles */
          video {
            -webkit-transform: translateZ(0);
          }
        }
      `}</style>
    </div>
  );
};

export default VideoCallUI;
