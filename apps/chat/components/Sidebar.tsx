import React, { useState } from "react";
import { Plus, Sun, Moon, X } from "lucide-react";
import { Conversation } from "../types";
import { ConversationListSkeleton } from "./Skeletons";

interface SidebarProps {
  conversations: Conversation[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: (name: string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  isLoading?: boolean;
  mobile?: boolean;
  onClose?: () => void;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-emerald-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeChatId,
  onSelectChat,
  onNewChat,
  theme,
  onToggleTheme,
  isLoading = false,
  mobile = false,
  onClose,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreateChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onNewChat(newName.trim());
      setNewName("");
      setShowModal(false);
    }
  };

  return (
    <aside
      className={[
        "w-[280px] h-full bg-slate-100/30 dark:bg-slate-900/50 flex flex-col border-r border-slate-200 dark:border-white/5 transition-colors duration-500 relative",
        mobile ? "shadow-2xl" : "",
      ].join(" ")}
    >
      <div className="p-6 md:p-8 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          Assist-AI
        </h1>
        <div className="flex items-center gap-1">
          {mobile && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 rounded-full transition-all"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="p-2 text-slate-400 hover:text-orange-500 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 rounded-full transition-all"
            aria-label="New chat"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <ConversationListSkeleton count={6} />
      ) : (
        <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-8">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="text-slate-400 dark:text-slate-600 text-sm mb-2">
                No conversations yet
              </div>
              <div className="text-slate-300 dark:text-slate-700 text-xs">
                Create a new chat to get started
              </div>
            </div>
          ) : (
            conversations.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 ${
                  activeChatId === chat.id
                    ? "bg-orange-500/10 text-orange-600 dark:text-white"
                    : "hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white text-xl font-bold ring-2 ring-slate-200 dark:ring-white/5 ${getAvatarColor(chat.name)}`}
                  >
                    {getInitials(chat.name)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-[3px] border-white dark:border-slate-900 rounded-full"></div>
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <div
                    className={`text-sm font-medium truncate ${activeChatId === chat.id ? "text-orange-600 dark:text-orange-500" : "text-slate-900 dark:text-slate-100"}`}
                  >
                    {chat.name}
                  </div>
                  <div className="text-[11px] truncate opacity-50 mt-0.5">
                    {chat.lastMessage || "New session..."}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* New Chat Modal - Fixed Blur Background */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl border border-slate-200 dark:border-white/10 transform transition-all animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Create Conversation
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateChat}>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3 ml-1">
                Contact Name
              </label>
              <input
                autoFocus
                type="text"
                placeholder="Type a name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-4 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 mb-8 transition-all"
              />
              <button
                type="submit"
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-orange-500/30 active:scale-[0.98]"
              >
                Start Chatting
              </button>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
