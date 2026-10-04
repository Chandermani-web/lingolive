export const getConversationPreview = (message) => {
  if (!message) return "Start a conversation";

  if (message.text && message.text.trim()) {
    return message.text.trim();
  }

  if (message.image) return "📷 Photo";
  if (message.video) return "🎥 Video";
  if (message.audio) return "🎵 Audio";
  if (message.file) return "📎 File";

  return "Start a conversation";
};

export const formatConversationTime = (value) => {
  if (!value) return "";

  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  if (sameDay) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" });

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

export const getMessageSenderId = (message) => {
  if (!message) return null;
  if (typeof message.sender === "object") return message.sender._id;
  return message.sender;
};

export const getMessageReceiverId = (message) => {
  if (!message) return null;
  if (typeof message.receiver === "object") return message.receiver._id;
  return message.receiver;
};
