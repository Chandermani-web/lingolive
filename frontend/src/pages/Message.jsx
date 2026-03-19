import { useEffect, useState } from "react";
import FriendsSidebar from "../Components/Messages/FriendSideBar";
import ChatPage from "../Components/Messages/ChatPage";
import { MessageCircle } from "lucide-react";

const Message = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-primary)] text-[var(--color-text)] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-4 h-4 bg-[var(--color-highlight)] rounded-full animate-ping"></div>
        <div className="absolute bottom-32 left-32 w-3 h-3 bg-[var(--color-highlight)]/80 rounded-full animate-bounce"></div>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-[var(--color-primary)] backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-80 transform bg-[var(--color-primary)] backdrop-blur-xl border-r border-[var(--color-secondary)]/50 transition-all duration-300 md:static md:translate-x-0 ${
          isSidebarOpen
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <FriendsSidebar
          selectedUser={selectedUser}
          onSelectFriend={(friend) => {
            setSelectedUser(friend);
            if (window.innerWidth < 768) setIsSidebarOpen(false);
          }}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 ml-0 md:ml-0 relative z-10">
        {selectedUser ? (
          <div className="h-full">
            <ChatPage
              selectedUser={selectedUser}
              onOpenSidebar={() => setIsSidebarOpen(true)}
            />
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center p-6 text-[var(--color-muted)]">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-highlight)] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <MessageCircle className="w-12 h-12 text-[var(--color-text)]" />
              </div>
              <p className="text-xl mb-4">Select a friend to start chatting</p>
              <p className="text-[var(--color-muted)] text-sm mb-6">
                Choose from your connections to begin messaging
              </p>
              <button
                className="inline-flex md:hidden items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-highlight)] hover:from-[var(--color-secondary)] hover:to-[var(--color-accent)] text-[var(--color-text)] font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                onClick={() => setIsSidebarOpen(true)}
              >
                <MessageCircle className="w-5 h-5" />
                Open Chats
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
