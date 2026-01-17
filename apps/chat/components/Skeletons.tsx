import React from 'react';

export const ConversationSkeleton: React.FC = () => {
  return (
    <div className="w-full flex items-center gap-4 p-3 rounded-2xl animate-pulse">
      <div className="relative flex-shrink-0">
        <div className="w-11 h-11 rounded-2xl bg-slate-200 dark:bg-slate-700"></div>
        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-slate-300 dark:bg-slate-600 border-[3px] border-white dark:border-slate-900 rounded-full"></div>
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2"></div>
      </div>
    </div>
  );
};

export const MessageSkeleton: React.FC<{ isUser?: boolean }> = ({ isUser = false }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-pulse`}>
      <div className={`max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-5 py-4 rounded-[1.75rem] ${
          isUser 
            ? 'bg-slate-200 dark:bg-slate-700 rounded-tr-none' 
            : 'bg-slate-200 dark:bg-slate-700 rounded-tl-none'
        }`}>
          <div className="space-y-2">
            <div className={`h-4 bg-slate-300 dark:bg-slate-600 rounded w-[150px] ${isUser ? 'bg-white/50' : ''}`}></div>
          </div>
        </div>
        <div className={`flex items-center gap-2 mt-2 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <div className="h-2 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export const ChatHeaderSkeleton: React.FC = () => {
  return (
    <header className="h-20 flex items-center justify-between px-10 border-b border-slate-200 dark:border-white/5 bg-transparent shrink-0 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-700"></div>
          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-slate-300 dark:bg-slate-600 rounded-full border-2 border-white dark:border-slate-900"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-700"></div>
        <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-700"></div>
      </div>
    </header>
  );
};

export const ConversationListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-8">
      {Array.from({ length: count }).map((_, idx) => (
        <ConversationSkeleton key={idx} />
      ))}
    </div>
  );
};

export const MessageListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="flex-1 overflow-y-auto px-10 py-8 space-y-8">
      {Array.from({ length: count }).map((_, idx) => (
        <MessageSkeleton key={idx} isUser={idx % 2 === 0} />
      ))}
    </div>
  );
};

