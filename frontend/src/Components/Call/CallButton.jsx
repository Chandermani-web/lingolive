import { Phone, Video } from "lucide-react";
import { useCall } from "../../Context/CallContext";

/**
 * CallButton Component - Use this to initiate calls from anywhere in your app
 * 
 * Usage:
 * <CallButton 
 *   userId="user123" 
 *   userName="John Doe"
 *   userAvatar="https://example.com/avatar.jpg"
 *   callType="video" // or "audio"
 * />
 */
const CallButton = ({ userId, userName, userAvatar, callType = "audio", className = "" }) => {
  const { startCall, callActive, callStatus } = useCall();

  const handleCall = () => {
    if (callActive || callStatus !== "idle") {
      alert("You're already in a call");
      return;
    }

    if (!userId) {
      alert("User ID is required to start a call");
      return;
    }

    startCall(userId, callType, userName, userAvatar);
  };

  return (
    <button
      onClick={handleCall}
      disabled={callActive || callStatus !== "idle"}
      className={`p-2 md:p-3 rounded-full transition-all ${
        callActive || callStatus !== "idle"
          ? "bg-gray-600 cursor-not-allowed opacity-50"
          : callType === "video"
          ? "bg-blue-600 hover:bg-blue-700 hover:scale-110"
          : "bg-green-600 hover:bg-green-700 hover:scale-110"
      } ${className}`}
      title={callType === "video" ? "Video Call" : "Voice Call"}
    >
      {callType === "video" ? (
        <Video className="w-5 h-5 text-white" />
      ) : (
        <Phone className="w-5 h-5 text-white" />
      )}
    </button>
  );
};

export default CallButton;
