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
          ? "bg-[var(--color-secondary)]/60 cursor-not-allowed opacity-50"
          : callType === "video"
          ? "bg-[var(--color-secondary)] hover:bg-[var(--color-highlight)] hover:scale-110"
          : "bg-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:scale-110"
      } ${className}`}
      title={callType === "video" ? "Video Call" : "Voice Call"}
    >
      {callType === "video" ? (
        <Video className="w-5 h-5 text-[var(--color-text)]" />
      ) : (
        <Phone className="w-5 h-5 text-[var(--color-text)]" />
      )}
    </button>
  );
};

export default CallButton;
