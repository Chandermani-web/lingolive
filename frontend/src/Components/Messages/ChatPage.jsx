import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Paperclip, Phone, Video, Trash2, MoreVertical } from "lucide-react";
import { useSocket } from "../../Context/SocketContext";
import { useCall } from "../../Context/CallContext";
import AppContext from "../../Context/UseContext";

const ChatPage = ({ selectedUser, onOpenSidebar }) => {
  const { socket, messages, setMessages, onlineUsers } = useSocket();
  const { startCall, callActive, callStatus } = useCall();
  const navigate = useNavigate();
  const { setShowImage, BASE_URL } = useContext(AppContext);

  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const [media, setMedia] = useState({ image: null, video: null, audio: null, file: null });
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedUser?._id) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/messages/${selectedUser._id}`, {
          credentials: "include",
        });
        const data = await res.json();
        setMessages(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [selectedUser, BASE_URL, setMessages]);

  const handleMedia = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const t = file.type;
    if (t.startsWith("image")) setMedia({ image: file, video: null, audio: null, file: null });
    else if (t.startsWith("video")) setMedia({ image: null, video: file, audio: null, file: null });
    else if (t.startsWith("audio")) setMedia({ image: null, video: null, audio: file, file: null });
    else setMedia({ image: null, video: null, audio: null, file });
  };

  const sendMessage = async () => {
    if (!text.trim() && !media.image && !media.video && !media.audio && !media.file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("receiverId", selectedUser._id);
      if (text.trim()) fd.append("text", text.trim());
      if (media.image) fd.append("image", media.image);
      if (media.video) fd.append("video", media.video);
      if (media.audio) fd.append("audio", media.audio);
      if (media.file) fd.append("file", media.file);

      const res = await fetch(`${BASE_URL}/api/messages`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      if (res.ok) {
        setText("");
        setMedia({ image: null, video: null, audio: null, file: null });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/api/messages/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) setMessages((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const online = onlineUsers.includes(selectedUser._id);

  return (
    <div className="flex flex-col h-full bg-[#05070A]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#18202B] bg-[#080B10]">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/5 text-secondary"
          onClick={onOpenSidebar}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="relative">
          <img
            src={selectedUser.profilePic || "/avatar.svg"}
            alt=""
            className="w-10 h-10 rounded-full object-cover cursor-pointer"
            onClick={() => setShowImage(selectedUser.profilePic || "/avatar.svg")}
          />
          <span
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#080B10]"
            style={{ background: online ? "#10B981" : "#52525B" }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h2
            className="text-sm font-semibold text-white cursor-pointer hover:text-[#8B5CF6] transition-colors truncate"
            onClick={() => navigate(`/profile/${selectedUser._id}`)}
          >
            @{selectedUser.username}
          </h2>
          <p className={`text-xs ${online ? "text-[#10B981]" : "text-muted"}`}>
            {online ? "Online" : "Offline"}
          </p>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => startCall(selectedUser._id, "video", selectedUser.name, selectedUser.avatar)}
            disabled={callActive || callStatus !== "idle"}
            className="btn-ghost p-2 disabled:opacity-40"
            title="Video call"
          >
            <Video className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={() => startCall(selectedUser._id, "audio", selectedUser.name, selectedUser.avatar)}
            disabled={callActive || callStatus !== "idle"}
            className="btn-ghost p-2 disabled:opacity-40"
            title="Voice call"
          >
            <Phone className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {messages.map((m, i) => {
          const senderId = typeof m.sender === "object" ? m.sender._id : m.sender;
          const isOwn = senderId !== selectedUser._id;
          const isMenuOpen = menuOpen === m._id;

          return (
            <div
              key={m._id || i}
              className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-fadeIn`}
            >
              <div className={`flex items-end gap-2 max-w-[75%] md:max-w-md ${isOwn ? "flex-row-reverse" : ""}`}>
                {!isOwn && (
                  <img
                    src={selectedUser.profilePic || "/avatar.svg"}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div
                  className={`py-2.5 px-4 rounded-2xl break-words relative group ${
                    isOwn
                      ? "bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white rounded-br-md"
                      : "bg-[#0F141C] border border-[#18202B] text-secondary rounded-bl-md"
                  }`}
                >
                  {isOwn && (
                    <div className="absolute -top-1 -right-1">
                      <button
                        onClick={() => setMenuOpen(isMenuOpen ? null : m._id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-full bg-[#0F141C] border border-[#18202B] transition-opacity"
                      >
                        <MoreVertical className="w-3 h-3 text-secondary" />
                      </button>
                      {isMenuOpen && (
                        <div className="absolute right-0 top-6 w-24 bg-[#0F141C] border border-[#18202B] rounded-lg overflow-hidden z-20 shadow-2xl">
                          <button
                            onClick={() => {
                              deleteMessage(m._id);
                              setMenuOpen(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#F43F5E] hover:bg-[#F43F5E]/5 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {m.image && (
                    <img
                      src={m.image}
                      alt=""
                      className="mt-1 rounded-lg max-w-[220px] cursor-pointer"
                      onClick={() => setShowImage(m.image)}
                    />
                  )}
                  {m.video && (
                    <video src={m.video} controls className="mt-1 rounded-lg max-w-[220px]" />
                  )}
                  {m.audio && <audio src={m.audio} controls className="mt-1 max-w-[220px]" />}
                  {m.file && (
                    <a
                      href={m.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline mt-1 block text-sm"
                    >
                      📎 Download file
                    </a>
                  )}
                  {m.text && <p className="text-sm leading-relaxed">{m.text}</p>}

                  <span
                    className={`text-[10px] block mt-1 text-right ${
                      isOwn ? "text-white/60" : "text-muted"
                    }`}
                  >
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
        <div ref={chatEndRef} />
      </div>

      {/* Media Preview */}
      {(media.image || media.video || media.audio || media.file) && (
        <div className="p-3 flex items-center gap-3 border-t border-[#18202B] bg-[#080B10]">
          {media.image && (
            <img
              src={URL.createObjectURL(media.image)}
              alt=""
              className="w-14 h-14 object-cover rounded-lg border border-[#18202B]"
            />
          )}
          {media.video && (
            <video
              src={URL.createObjectURL(media.video)}
              className="w-14 h-14 rounded-lg border border-[#18202B]"
            />
          )}
          {media.audio && (
            <audio src={URL.createObjectURL(media.audio)} controls className="w-48" />
          )}
          {media.file && (
            <p className="text-xs text-secondary truncate max-w-[150px]">
              📎 {media.file.name}
            </p>
          )}
          <button
            onClick={() => setMedia({ image: null, video: null, audio: null, file: null })}
            className="ml-auto text-xs text-[#F43F5E] hover:text-[#F87171] transition-colors"
          >
            Remove
          </button>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 p-3 border-t border-[#18202B] bg-[#080B10]">
        <button
          onClick={() => document.getElementById("media-input").click()}
          className="btn-ghost p-2.5"
        >
          <Paperclip className="w-[18px] h-[18px]" />
        </button>
        <input
          type="file"
          id="media-input"
          className="hidden"
          onChange={handleMedia}
        />

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Type a message..."
          className="input flex-1 py-2.5 text-sm"
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="p-2.5 btn-primary rounded-lg disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatPage;