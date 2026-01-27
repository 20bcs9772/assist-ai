
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { useChat } from './hooks/useChat';

const App: React.FC = () => {
  const { 
    conversations, 
    activeChatId, 
    activeChat, 
    streamingStatus,
    isThinking,
    isLoading,
    isLoadingConversation,
    setActiveChat, 
    startNewChat, 
    sendMessage,
    deleteConversation
  } = useChat();

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-slate-950 items-center justify-center p-4 md:p-8 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-200 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 overflow-hidden font-sans antialiased transition-colors duration-500">
      <div className="flex w-full max-w-7xl h-full max-h-none md:max-h-[900px] bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl md:rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-500">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar 
            conversations={conversations}
            activeChatId={activeChatId}
            onSelectChat={(id) => {
              setActiveChat(id);
            }}
            onNewChat={(name) => startNewChat(name)}
            theme={theme}
            onToggleTheme={toggleTheme}
            isLoading={isLoading}
          />
        </div>

        {/* Mobile sidebar drawer */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 z-[90] bg-slate-950/40 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <div
              className="h-full w-[280px] max-w-[85vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar
                conversations={conversations}
                activeChatId={activeChatId}
                onSelectChat={(id) => {
                  setActiveChat(id);
                  setIsMobileSidebarOpen(false);
                }}
                onNewChat={(name) => {
                  startNewChat(name);
                  setIsMobileSidebarOpen(false);
                }}
                theme={theme}
                onToggleTheme={toggleTheme}
                isLoading={isLoading}
                mobile
                onClose={() => setIsMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        <main className="flex-1 h-full overflow-hidden flex flex-col bg-slate-50/50 dark:bg-slate-950/30">
          <ChatWindow 
            chat={activeChat} 
            onSendMessage={sendMessage} 
            onDeleteChat={() => activeChatId && deleteConversation(activeChatId)}
            streamingStatus={streamingStatus}
            isThinking={isThinking}
            theme={theme}
            onToggleTheme={toggleTheme}
            isLoading={isLoadingConversation}
            onOpenSidebar={() => setIsMobileSidebarOpen(true)}
          />
        </main>
      </div>
    </div>
  );
};

export default App;
