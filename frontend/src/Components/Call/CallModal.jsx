import { useEffect } from "react";
import { Phone, PhoneOff, Video, User, Volume2 } from "lucide-react";

const CallModal = ({ incomingCall, acceptCall, rejectCall }) => {
  useEffect(() => {
    if (incomingCall) {
      // Play ringtone sound
      const audio = new Audio("/ringtone.mp3");
      audio.loop = true;
      audio.play().catch(() => {
        // Handle autoplay restrictions
        console.log("Ringtone autoplay blocked");
      });

      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [incomingCall]);

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 md:p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700 animate-slideUp">
        {/* Call Type Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 animate-pulse-slow">
            {incomingCall.callType === "video" ? (
              <Video className="w-10 h-10 md:w-12 md:h-12 text-white" />
            ) : (
              <Volume2 className="w-10 h-10 md:w-12 md:h-12 text-white" />
            )}
          </div>
          
          <h2 className="text-white text-2xl md:text-3xl font-bold mb-2">
            Incoming {incomingCall.callType === "video" ? "Video" : "Voice"} Call
          </h2>
        </div>

        {/* Caller Info */}
        <div className="text-center mb-8">
          {/* Caller Avatar */}
          <div className="flex justify-center mb-4">
            {incomingCall.callerAvatar ? (
              <img
                src={incomingCall.callerAvatar}
                alt={incomingCall.callerName}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-blue-500 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center border-4 border-blue-500 shadow-lg">
                <User className="w-10 h-10 md:w-12 md:h-12 text-gray-300" />
              </div>
            )}
          </div>

          {/* Caller Name */}
          <p className="text-gray-200 text-xl md:text-2xl font-semibold mb-1">
            {incomingCall.callerName || "Unknown User"}
          </p>
          <p className="text-gray-400 text-sm md:text-base animate-pulse">
            is calling you...
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center items-center">
          {/* Reject Button */}
          <button
            onClick={rejectCall}
            className="group relative flex flex-col items-center gap-2 transition-all hover:scale-110"
            title="Reject Call"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg hover:shadow-red-600/50 transition-all">
              <PhoneOff className="w-7 h-7 md:w-9 md:h-9 text-white" />
            </div>
            <span className="text-red-500 text-xs md:text-sm font-semibold">
              Decline
            </span>
          </button>

          {/* Accept Button */}
          <button
            onClick={acceptCall}
            className="group relative flex flex-col items-center gap-2 transition-all hover:scale-110"
            title="Accept Call"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center shadow-lg hover:shadow-green-600/50 transition-all animate-pulse-ring">
              <Phone className="w-7 h-7 md:w-9 md:h-9 text-white" />
            </div>
            <span className="text-green-500 text-xs md:text-sm font-semibold">
              Accept
            </span>
          </button>
        </div>

        {/* Call Type Badge */}
        <div className="mt-6 text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-gray-700/50 text-gray-300 text-xs md:text-sm">
            {incomingCall.callType === "video" ? "📹 Video Call" : "🎙️ Voice Call"}
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes pulseSlow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }

        @keyframes pulseRing {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          50% {
            box-shadow: 0 0 0 20px rgba(34, 197, 94, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }

        .animate-pulse-slow {
          animation: pulseSlow 2s ease-in-out infinite;
        }

        .animate-pulse-ring {
          animation: pulseRing 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CallModal;