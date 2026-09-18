import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import FriendsSidebar from "../Components/Messages/FriendSideBar";
import ChatPage from "../Components/Messages/ChatPage";

const Message = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#05070A] relative overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-30 w-80 transform transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <FriendsSidebar
          selectedUser={selectedUser}
          onSelectFriend={(friend) => {
            setSelectedUser(friend);
            if (window.innerWidth < 768) setSidebarOpen(false);
          }}
        />
      </div>

      <div className="flex-1 relative z-10">
        {selectedUser ? (
          <ChatPage
            selectedUser={selectedUser}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        ) : (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#0F141C] border border-[#18202B] flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-[#8B5CF6]" />
              </div>
              <h3 className="heading-md text-white mb-2">
                Your Messages
              </h3>
              <p className="text-sm text-muted mb-5">
                Select a conversation to start chatting
              </p>
              <button
                className="btn-primary md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <MessageCircle className="w-4 h-4" />
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