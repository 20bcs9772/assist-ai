import { useState, useEffect } from 'react';

const thinkingMessages = [
  'Thinking...',
  'Processing...',
  'Analyzing...',
  'Reviewing...',
  'Understanding...',
  'Computing...',
  'Evaluating...',
];

export function useThinkingMessage(isThinking: boolean, interval: number = 1500) {
  const [currentMessage, setCurrentMessage] = useState(thinkingMessages[0]);

  useEffect(() => {
    if (!isThinking) {
      setCurrentMessage(thinkingMessages[0]);
      return;
    }

    // Set initial random message
    const randomIndex = Math.floor(Math.random() * thinkingMessages.length);
    setCurrentMessage(thinkingMessages[randomIndex]);

    // Rotate through messages
    const messageInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * thinkingMessages.length);
      setCurrentMessage(thinkingMessages[randomIndex]);
    }, interval);

    return () => clearInterval(messageInterval);
  }, [isThinking, interval]);

  return currentMessage;
}

