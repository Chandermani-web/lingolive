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
    remoteUserId,
  } = useCall();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const callStartTimeRef = useRef(null);

  // Set up video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
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
          const elapsed = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
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
      className={`fixed inset-0 z-50 bg-gray-900 flex flex-col ${
        isFullscreen ? "p-0" : "p-2 md:p-4"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4 bg-gray-800/50 backdrop-blur-sm rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm md:text-base">
              {callType === "video" ? "Video Call" : "Voice Call"}
            </h3>
            <p className="text-gray-400 text-xs md:text-sm">
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
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors hidden md:block"
        >
          <Maximize2 className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative bg-black rounded-b-lg overflow-hidden">
        {/* Remote Video/Avatar */}
        <div className="absolute inset-0 flex items-center justify-center">
          {remoteStream && callType === "video" ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                <User className="w-12 h-12 md:w-16 md:h-16 text-white" />
              </div>
              <p className="text-white text-lg md:text-xl font-semibold">
                {callStatus === "connected" ? "On Call" : "Connecting..."}
              </p>
            </div>
          )}

          {/* Connection Status Overlay */}
          {callStatus !== "connected" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                <p className="text-white text-lg">
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

        {/* Local Video (Picture-in-Picture) */}
        {localStream && callType === "video" && (
          <div className="absolute top-4 right-4 w-24 h-32 md:w-32 md:h-40 bg-gray-800 rounded-lg overflow-hidden shadow-2xl border-2 border-gray-700">
            {!isVideoOff ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <VideoOff className="w-8 h-8 text-gray-500" />
              </div>
            )}
          </div>
        )}

        {/* Audio Call Local Avatar */}
        {localStream && callType === "audio" && (
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
              <User className="w-10 h-10 md:w-12 md:h-12 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 md:p-6 bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-3 md:gap-4 max-w-md mx-auto">
          {/* Mute/Unmute */}
          <button
            onClick={toggleMute}
            className={`p-3 md:p-4 rounded-full transition-all ${
              isMuted
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <MicOff className="w-5 h-5 md:w-6 md:h-6 text-white" />
            ) : (
              <Mic className="w-5 h-5 md:w-6 md:h-6 text-white" />
            )}
          </button>

          {/* End Call */}
          <button
            onClick={endCall}
            className="p-4 md:p-5 rounded-full bg-red-600 hover:bg-red-700 transition-all transform hover:scale-105"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </button>

          {/* Video Toggle (only for video calls) */}
          {callType === "video" && (
            <button
              onClick={toggleVideo}
              className={`p-3 md:p-4 rounded-full transition-all ${
                isVideoOff
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
              title={isVideoOff ? "Turn on camera" : "Turn off camera"}
            >
              {isVideoOff ? (
                <VideoOff className="w-5 h-5 md:w-6 md:h-6 text-white" />
              ) : (
                <Video className="w-5 h-5 md:w-6 md:h-6 text-white" />
              )}
            </button>
          )}
        </div>

        {/* Call Info */}
        <div className="text-center mt-4 text-gray-400 text-xs md:text-sm">
          {isMuted && <span className="inline-block mr-2">🔇 Muted</span>}
          {isVideoOff && callType === "video" && (
            <span className="inline-block">📷 Camera Off</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCallUI;