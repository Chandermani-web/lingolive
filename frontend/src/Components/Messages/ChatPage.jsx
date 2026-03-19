import { useContext, useEffect, useRef, useState } from "react";
import { useSocket } from "../../Context/SocketContext";
import { useCall } from "../../Context/CallContext";
import { Send, FolderUpIcon } from "lucide-react";
import "remixicon/fonts/remixicon.css";
import { useNavigate } from "react-router-dom";
import AppContext from "../../Context/UseContext";

const ChatPage = ({ selectedUser, onOpenSidebar }) => {
  const {
  socket,
  messages,
  setMessages,
  onlineUsers
} = useSocket();

  // Get call functions from CallContext
  const { startCall, callActive, callStatus } = useCall();

const navigate = useNavigate();
  const { setShowImage } = useContext(AppContext);
  const [text, setText] = useState("");
  const [editOn, setEditOn] = useState(false);
  const [media, setMedia] = useState({
    image: null,
    video: null,
    audio: null,
    file: null,
  });
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch chat history
  useEffect(() => {
    if (!selectedUser?._id) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `https://lingolive.onrender.com/api/messages/${selectedUser._id}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        ("Fetched messages:", data);
        setMessages(data || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const type = file.type;
    if (type.startsWith("image"))
      setMedia({ image: file, video: null, audio: null, file: null });
    else if (type.startsWith("video"))
      setMedia({ image: null, video: file, audio: null, file: null });
    else if (type.startsWith("audio"))
      setMedia({ image: null, video: null, audio: file, file: null });
    else setMedia({ image: null, video: null, audio: null, file });
  };

  // Send new message
  const sendMessage = async () => {
    if (
      !text.trim() &&
      !media.image &&
      !media.video &&
      !media.audio &&
      !media.file
    )
      return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("receiverId", selectedUser._id);
      if (text.trim()) formData.append("text", text.trim());
      if (media.image) formData.append("image", media.image);
      if (media.video) formData.append("video", media.video);
      if (media.audio) formData.append("audio", media.audio);
      if (media.file) formData.append("file", media.file);

      const res = await fetch("https://lingolive.onrender.com/api/messages", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data?.data) {
        setText("");
        setMedia({ image: null, video: null, audio: null, file: null });
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const res = await fetch(
        `https://lingolive.onrender.com/api/messages/${messageId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-primary)] border-l border-[var(--color-secondary)]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[var(--color-secondary)] bg-[var(--color-primary)]">
        <button
          className="md:hidden mr-1 flex flex-col items-center justify-center w-9 h-9 rounded-md bg-[var(--color-secondary)] text-[var(--color-text)]"
          onClick={onOpenSidebar}
          aria-label="Open chats"
        >
          {/* simple hamburger */}
          <span className="block w-5 h-0.5 bg-[var(--color-text)] mb-1"></span>
          <span className="block w-5 h-0.5 bg-[var(--color-text)] mb-1"></span>
          <span className="block w-5 h-0.5 bg-[var(--color-text)]"></span>
        </button>
        <img
          src={selectedUser.profilePic || "/default-avatar.png"}
          alt="profile"
          className="w-10 h-10 rounded-full object-cover"
          onClick={() => {
            setShowImage(selectedUser.profilePic || "/default-avatar.png");
          }}
        />
        <div className="flex-1">
          <h2
            className="text-[var(--color-text)] font-semibold text-lg"
            onClick={() => {
              navigate(`/profile/${selectedUser._id}`);
            }}
          >
            @{selectedUser.username}
          </h2>
          <p className="text-[var(--color-muted)] text-sm">
            {onlineUsers.includes(selectedUser._id) ? "🟢Online" : "🔴Offline"}
          </p>
        </div>

        {/* Call Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => startCall(selectedUser._id, "video", selectedUser.name, selectedUser.avatar)}
            disabled={callActive || callStatus !== "idle"}
            className="p-2 bg-[var(--color-secondary)] hover:bg-[var(--color-highlight)] disabled:bg-[var(--color-secondary)]/60 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="Video Call"
          >
            <i className="ri-vidicon-line text-[var(--color-text)]"></i>
          </button>

          <button
            onClick={() => startCall(selectedUser._id, "audio", selectedUser.name, selectedUser.avatar)}
            disabled={callActive || callStatus !== "idle"}
            className="p-2 bg-[var(--color-accent)] hover:bg-[var(--color-highlight)] disabled:bg-[var(--color-secondary)]/60 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="Voice Call"
          >
            <i className="ri-phone-line text-[var(--color-text)]"></i>
          </button>
        </div>
        
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 custom-scrollbar">
        {messages.map((m) => {
          const senderId =
            typeof m.sender === "object" ? m.sender._id : m.sender;
          const isOwn = senderId !== selectedUser._id;
          const isMenuOpen = editOn === m._id; // active message dropdown

          return (
            <div
              key={m._id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-end gap-2 max-w-[80%] md:max-w-xs ${
                  isOwn ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {!isOwn && (
                  <img
                    src={selectedUser.profilePic || "/default-avatar.png"}
                    alt="profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div
                  className={`py-3 px-4 rounded-2xl break-words relative group ${
                    isOwn
                      ? "bg-[var(--color-secondary)] text-[var(--color-text)] rounded-br-none"
                      : "bg-[var(--color-secondary)]/40 text-[var(--color-text)] rounded-bl-none"
                  }`}
                >
                  {/* 3-dot menu button */}
                  {isOwn && (
                    <div className="absolute top-1 right-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditOn(isMenuOpen ? null : m._id);
                        }}
                        className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition"
                      >
                        <i className="ri-more-2-line text-xs"></i>
                      </button>

                      {/* Dropdown menu */}
                      {isMenuOpen && (
                        <div
                          className="absolute right-0 mt-6 w-28 bg-[var(--color-primary)] border border-[var(--color-secondary)] rounded-lg shadow-md z-20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              deleteMessage(m._id);
                              setEditOn(null);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-[var(--color-highlight)] hover:bg-[var(--color-secondary)]/30 rounded-t-lg"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message content */}
                  {m.image && (
                    <img
                      src={m.image}
                      alt="sent"
                      className="mt-2 max-w-xs shadow-lg w-[200px] h-[200px] object-cover"
                      onClick={()=>setShowImage(m.image)}
                    />
                  )}
                  {m.video && (
                    <video
                      src={m.video}
                      controls
                      className="mt-2 max-w-xs shadow-lg w-[200px] h-[200px] object-cover"
                    />
                  )}
                  {m.audio && <audio src={m.audio} controls className="mt-2" />}
                  {m.file && (
                    <a
                      href={m.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-highlight)] underline mt-2 block"
                    >
                      📎 Download file
                    </a>
                  )}
                  {m.text && <p className="text-sm">{m.text}</p>}
                <span className={`text-[10px] block mt-2 text-right ${isOwn ? "text-[var(--color-text)]" : "text-[var(--color-muted)]"
                  }`}>
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                  </div>
              </div>
            </div>
          );
        })}

        <div ref={chatEndRef}></div>
      </div>

      {/* Media preview before sending */}
      {(media.image || media.video || media.audio || media.file) && (
        <div className="p-2 flex items-center gap-3 border-t border-[var(--color-secondary)] bg-[var(--color-primary)]">
          {media.image && (
            <img
              src={URL.createObjectURL(media.image)}
              alt="preview"
              className="w-20 h-20 object-cover rounded-lg border border-[var(--color-secondary)]"
            />
          )}
          {media.video && (
            <video
              src={URL.createObjectURL(media.video)}
              controls
              className="w-24 h-20 rounded-lg border border-[var(--color-secondary)]"
            />
          )}
          {media.audio && (
            <audio
              src={URL.createObjectURL(media.audio)}
              controls
              className="w-48"
            />
          )}
          {media.file && (
            <p className="text-sm text-[var(--color-muted)] truncate max-w-[150px]">
              📎 {media.file.name}
            </p>
          )}
          <button
            onClick={() =>
              setMedia({ image: null, video: null, audio: null, file: null })
            }
            className="text-red-400 text-xs underline"
          >
            Remove
          </button>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center border-t border-[var(--color-secondary)] p-3 bg-[var(--color-primary)]">
        <FolderUpIcon
          className="cursor-pointer mr-3 text-[var(--color-highlight)]"
          onClick={() => document.getElementById("media").click()}
        />
        <input
          type="file"
          id="media"
          className="hidden"
          onChange={handleMediaChange}
        />

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 bg-[var(--color-secondary)]/40 text-[var(--color-text)] p-2 rounded-full outline-none focus:ring-2 focus:ring-[var(--color-highlight)]"
        />
        <button
          onClick={sendMessage}
          className={`ml-3 p-2 ${loading ? "bg-[var(--color-secondary)]/60" : "bg-[var(--color-accent)]"} ${loading ? "hover:bg-[var(--color-secondary)]/70" : "hover:bg-[var(--color-highlight)]"} rounded-full transition`}
          disabled={loading}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
