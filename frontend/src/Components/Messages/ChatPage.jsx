import { useContext, useEffect, useRef, useState } from "react";
import { useSocket } from "../../Context/SocketContext";
import { Send, FolderUpIcon } from "lucide-react";
import "remixicon/fonts/remixicon.css";
import { useNavigate } from "react-router-dom";
import AppContext from "../../Context/UseContext";

const ChatPage = ({ selectedUser, onOpenSidebar }) => {
  const navigate = useNavigate();
  const { messages, setMessages, onlineUsers } = useSocket();
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
    <div className="flex flex-col h-full bg-[#050A15] border-l border-gray-800">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-800 bg-[#050A15]">
        <button
          className="md:hidden mr-1 flex flex-col items-center justify-center w-9 h-9 rounded-md bg-gray-800 text-white"
          onClick={onOpenSidebar}
          aria-label="Open chats"
        >
          {/* simple hamburger */}
          <span className="block w-5 h-0.5 bg-white mb-1"></span>
          <span className="block w-5 h-0.5 bg-white mb-1"></span>
          <span className="block w-5 h-0.5 bg-white"></span>
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
            className="text-white font-semibold text-lg"
            onClick={() => {
              navigate(`/profile/${selectedUser._id}`);
            }}
          >
            @{selectedUser.username}
          </h2>
          <p className="text-gray-400 text-sm">
            {onlineUsers.includes(selectedUser._id) ? "🟢Online" : "🔴Offline"}
          </p>
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
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-800 text-gray-100 rounded-bl-none"
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
                        className="text-gray-300 hover:text-white transition"
                      >
                        <i className="ri-more-2-line text-xs"></i>
                      </button>

                      {/* Dropdown menu */}
                      {isMenuOpen && (
                        <div
                          className="absolute right-0 mt-6 w-28 bg-gray-900 border border-gray-700 rounded-lg shadow-md z-20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              deleteMessage(m._id);
                              setEditOn(null);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-800 rounded-t-lg"
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
                      className="rounded-lg mt-2 max-w-[200px] h-[150px] object-cover"
                      onClick={()=>setShowImage(m.image)}
                    />
                  )}
                  {m.video && (
                    <video
                      src={m.video}
                      controls
                      className="rounded-lg mt-2 max-w-[250px] h-[150px] object-cover"
                    />
                  )}
                  {m.audio && <audio src={m.audio} controls className="mt-2" />}
                  {m.file && (
                    <a
                      href={m.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline mt-2 block"
                    >
                      📎 Download file
                    </a>
                  )}
                  {m.text && <p className="text-sm">{m.text}</p>}
                <span className={`text-[10px] block mt-2 text-right ${isOwn ? "text-blue-100" : "text-gray-400"
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
        <div className="p-2 flex items-center gap-3 border-t border-gray-800 bg-gray-900">
          {media.image && (
            <img
              src={URL.createObjectURL(media.image)}
              alt="preview"
              className="w-20 h-20 object-cover rounded-lg border border-gray-700"
            />
          )}
          {media.video && (
            <video
              src={URL.createObjectURL(media.video)}
              controls
              className="w-24 h-20 rounded-lg border border-gray-700"
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
            <p className="text-sm text-gray-300 truncate max-w-[150px]">
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
      <div className="flex items-center border-t border-gray-800 p-3 bg-gray-900">
        <FolderUpIcon
          className="cursor-pointer mr-3 text-amber-500"
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
          className="flex-1 bg-gray-800 text-white p-2 rounded-full outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          onClick={sendMessage}
          className={`ml-3 p-2 ${loading ? "bg-gray-600" : "bg-blue-600"} ${loading ? "hover:bg-gray-700" : "hover:bg-blue-700"} rounded-full transition`}
          disabled={loading}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
