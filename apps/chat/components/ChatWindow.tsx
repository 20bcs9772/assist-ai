import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  MoreVertical,
  Sparkles,
  Sun,
  Moon,
  Trash2,
  ChevronDown,
  Infinity,
  Info,
} from "lucide-react";
import { Message, Conversation, AgentType } from "../types";
import { ChatHeaderSkeleton, MessageListSkeleton } from "./Skeletons";
import { MessageContent } from "./MessageContent";

interface ChatWindowProps {
  chat: Conversation | undefined;
  onSendMessage: (content: string) => void;
  onDeleteChat: () => void;
  streamingStatus: "idle" | "loading" | "streaming" | "error";
  isThinking?: boolean;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  isLoading?: boolean;
}

const AGENTS: Record<
  Exclude<AgentType, "auto">,
  { label: string; info: string }
> = {
  SUPPORT: {
    label: "Support",
    info: "Specialized in technical troubleshooting and documentation.",
  },
  ORDER: {
    label: "Order",
    info: "Handles tracking, shipping, and order management queries.",
  },
  BILLING: {
    label: "Billing",
    info: "Resolves questions about invoices, payments, and plans.",
  },
};

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

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  onSendMessage,
  onDeleteChat,
  streamingStatus,
  isThinking = false,
  theme,
  onToggleTheme,
  isLoading = false,
}) => {
  const [input, setInput] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [hoveredAgent, setHoveredAgent] = useState<keyof typeof AGENTS | null>(
    null
  );
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const agentInfoRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chat?.messages, streamingStatus]);

  const updateTooltipPosition = (element: HTMLDivElement) => {
    const rect = element.getBoundingClientRect();
    const tooltipWidth = 256;
    const tooltipHeight = 120;
    const spacing = 8;

    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    let top = rect.top - tooltipHeight - spacing;

    if (left < 10) left = 10;
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipWidth - 10;
    }

    if (top < 10) {
      top = rect.bottom + spacing;
    }

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowAgentDropdown(false);
        setHoveredAgent(null);
        setTooltipPosition(null);
      }
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        const target = event.target as HTMLElement;
        if (!target.closest("[data-agent-info]")) {
          setHoveredAgent(null);
          setTooltipPosition(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (hoveredAgent && tooltipPosition) {
      const handleScroll = () => {
        const element = agentInfoRefs.current.get(hoveredAgent);
        if (element) {
          updateTooltipPosition(element);
        }
      };

      const handleResize = () => {
        const element = agentInfoRefs.current.get(hoveredAgent);
        if (element) {
          updateTooltipPosition(element);
        }
      };

      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [hoveredAgent, tooltipPosition]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && streamingStatus === "idle") {
      onSendMessage(input);
      setInput("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-transparent">
        <ChatHeaderSkeleton />
        <MessageListSkeleton count={4} />
        <div className="px-6 pb-4 pt-2 shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 animate-pulse">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
              <div className="flex items-center justify-between">
                <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col h-full bg-transparent">
        <header className="h-20 flex items-center justify-end px-10 border-b border-slate-200 dark:border-white/5">
          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-white transition-all"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
          <div className="p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 bg-white/40 dark:bg-slate-900/20 text-center">
            <Sparkles
              size={48}
              className="mx-auto mb-6 opacity-20 text-orange-500"
            />
            <h2 className="text-xl font-medium text-slate-500 dark:text-slate-400 mb-2">
              Ready to assist
            </h2>
            <p className="text-sm opacity-50 max-w-[200px]">
              Select a conversation to begin your AI-powered session.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Header */}
      <header className="h-20 flex items-center justify-between px-10 border-b border-slate-200 dark:border-white/5 bg-transparent shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xl font-bold ring-1 ring-slate-200 dark:ring-white/10 ${getAvatarColor(chat.name)}`}
            >
              {getInitials(chat.name)}
            </div>
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              {chat.name}
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Live Connection
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 relative" ref={optionsRef}>
          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-white transition-all shadow-sm"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <MoreVertical size={20} />
          </button>
          {showOptions && (
            <div className="absolute top-full right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2">
              <button
                onClick={() => {
                  onDeleteChat();
                  setShowOptions(false);
                }}
                className="w-full flex items-center gap-3 px-5 py-4 text-sm text-red-500 hover:bg-red-500/10 transition-colors font-semibold"
              >
                <Trash2 size={16} /> Delete Conversation
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-10 py-8 space-y-8 scroll-smooth"
      >
        {chat.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "USER" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] ${msg.role === "USER" ? "items-end" : "items-start"} group`}
            >
              <div
                className={`px-5 py-4 rounded-[1.75rem] text-[0.9375rem] leading-relaxed shadow-lg ${msg.role === "USER" ? "bg-orange-500 text-white rounded-tr-none shadow-orange-500/20" : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-white/5"}`}
              >
                <MessageContent
                  content={msg.content}
                  isUser={msg.role === "USER"}
                />
                {msg.isStreaming && (
                  <span
                    className={`inline-block ml-1 w-1.5 h-4 cursor-blink align-middle ${msg.role === "USER" ? "bg-white/50" : "bg-orange-500/50"}`}
                  ></span>
                )}
              </div>
              <div
                className={`flex items-center gap-2 mt-2 px-1 ${msg.role === "USER" ? "justify-end" : "justify-start"}`}
              >
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
        {(streamingStatus === "loading" || isThinking) && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 px-5 py-4 rounded-[1.75rem] rounded-tl-none shadow-sm">
              {isThinking ? (
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex space-x-1.5">
                    <div
                      className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                  <span className="ml-2 font-medium">Thinking...</span>
                </div>
              ) : (
                <div className="flex space-x-1.5">
                  <div
                    className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-6 pb-4 pt-2 shrink-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          {/* Tooltip for Hovered Agent Info Icon */}
          {hoveredAgent && tooltipPosition && (
            <div
              ref={tooltipRef}
              data-agent-tooltip
              className="fixed z-[100] w-64 bg-slate-900 dark:bg-slate-800 p-4 rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 animate-in fade-in slide-in-from-bottom-2 pointer-events-auto"
              style={{
                top: `${tooltipPosition.top}px`,
                left: `${tooltipPosition.left}px`,
              }}
              onMouseEnter={() => {
                if (hoveredAgent) {
                  const element = agentInfoRefs.current.get(hoveredAgent);
                  if (element) {
                    updateTooltipPosition(element);
                  }
                }
              }}
              onMouseLeave={(e) => {
                const relatedTarget = e.relatedTarget as HTMLElement;
                if (
                  !relatedTarget ||
                  (!relatedTarget.closest("[data-agent-info]") &&
                    !relatedTarget.closest("[data-agent-tooltip]"))
                ) {
                  setHoveredAgent(null);
                  setTooltipPosition(null);
                }
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
                  {AGENTS[hoveredAgent].label} Expert
                </span>
              </div>
              <p className="text-[11px] text-white dark:text-slate-200 leading-relaxed font-semibold">
                {AGENTS[hoveredAgent].info}
              </p>
              <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-slate-900 dark:bg-slate-800 border-r border-b border-slate-200 dark:border-white/10 rotate-45" />
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-xl transition-all focus-within:ring-2 focus-within:ring-orange-500/20 relative">
            <textarea
              rows={1}
              placeholder="How can Assist-AI help you today?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={streamingStatus !== "idle"}
              className="w-full bg-transparent text-[0.9375rem] text-slate-900 dark:text-slate-100 focus:outline-none placeholder-slate-400 dark:placeholder-slate-600 resize-none min-h-[30px]"
            />

            <div className="flex items-center justify-between mt-4">
              <div
                className="flex items-center gap-2 relative"
                ref={dropdownRef}
              >
                {/* Agent Selector Button (Informational only) */}
                <button
                  type="button"
                  onClick={() => setShowAgentDropdown(!showAgentDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border border-slate-200 dark:border-white/5 transition-all"
                >
                  <Infinity size={14} className="text-orange-500" />
                  <span>
                    Agent:{" "}
                    <span className="text-slate-900 dark:text-white">Auto</span>
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-300 ${showAgentDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Agent Dropdown - Non-selectable */}
                {showAgentDropdown && (
                  <div className="absolute bottom-full left-0 mb-3 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-[70] overflow-hidden p-2 animate-in fade-in slide-in-from-bottom-2">
                    <div className="px-3 py-2 mb-2 bg-orange-500/10 dark:bg-orange-500/5 rounded-xl">
                      <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold leading-tight">
                        Agents are auto-selected based on your input to provide
                        the best response.
                      </p>
                    </div>
                    {(Object.keys(AGENTS) as (keyof typeof AGENTS)[]).map(
                      (type) => (
                        <div
                          key={type}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 group transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-orange-500 transition-colors" />
                            {AGENTS[type].label}
                          </div>
                          <div
                            ref={(el) => {
                              if (el) {
                                agentInfoRefs.current.set(type, el);
                              } else {
                                agentInfoRefs.current.delete(type);
                              }
                            }}
                            data-agent-info
                            className="p-1 cursor-help relative"
                            onMouseEnter={(e) => {
                              const element = e.currentTarget;
                              setHoveredAgent(type);
                              updateTooltipPosition(element);
                            }}
                            onMouseLeave={(e) => {
                              const relatedTarget =
                                e.relatedTarget as HTMLElement;
                              if (
                                !relatedTarget ||
                                (!relatedTarget.closest(
                                  "[data-agent-tooltip]"
                                ) &&
                                  !relatedTarget.closest("[data-agent-info]"))
                              ) {
                                setHoveredAgent(null);
                                setTooltipPosition(null);
                              }
                            }}
                          >
                            <Info
                              size={14}
                              className={`transition-opacity ${hoveredAgent === type ? "opacity-100 text-orange-500" : "opacity-40 text-slate-400"}`}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!input.trim() || streamingStatus !== "idle"}
                className={`p-2 rounded-xl transition-all ${
                  input.trim() && streamingStatus === "idle"
                    ? "text-orange-500 hover:scale-110 active:scale-95"
                    : "text-slate-300 dark:text-slate-800 cursor-not-allowed"
                }`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
