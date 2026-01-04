import { useEffect, useState } from 'react';
import { Brain, Sparkles } from 'lucide-react';

interface ThinkingStateProps {
  isActive: boolean;
}

const THINKING_MESSAGES = [
  "AI is analyzing viral trends...",
  "Identifying target audience psychology...",
  "Evaluating psychological triggers (Fear, Greed, Curiosity)...",
  "Optimizing pacing for retention at 5s, 15s, 30s...",
  "Crafting attention-grabbing opening...",
  "Structuring narrative arc for maximum engagement...",
  "Critic is reviewing story logic...",
  "Checking for plot holes and inconsistencies...",
  "Finalizing scene transitions...",
  "Calculating clickbait score...",
  "Almost ready..."
];

export function ThinkingState({ isActive }: ThinkingStateProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<string[]>([]);

  useEffect(() => {
    if (!isActive) {
      setCurrentMessageIndex(0);
      setDisplayedMessages([]);
      return;
    }

    // Add messages progressively
    const interval = setInterval(() => {
      if (currentMessageIndex < THINKING_MESSAGES.length) {
        setDisplayedMessages((prev) => [...prev, THINKING_MESSAGES[currentMessageIndex]]);
        setCurrentMessageIndex((prev) => prev + 1);
      }
    }, 3000); // Add a new message every 3 seconds

    return () => clearInterval(interval);
  }, [isActive, currentMessageIndex]);

  if (!isActive) return null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <Brain className="w-6 h-6 text-youtube-red animate-pulse" />
          <Sparkles className="w-4 h-4 text-youtube-red absolute -top-1 -right-1 animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-white">AI Thinking Process</h3>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
        {displayedMessages.length === 0 ? (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-2 h-2 bg-youtube-red rounded-full animate-pulse" />
            <span className="text-sm">Initializing thinking process...</span>
          </div>
        ) : (
          displayedMessages.map((message, index) => (
            <div
              key={index}
              className="flex items-start gap-3 text-sm animate-fade-in"
            >
              <div className="w-2 h-2 bg-youtube-red rounded-full mt-1.5 flex-shrink-0" />
              <span className="text-gray-300">{message}</span>
            </div>
          ))
        )}
        
        {currentMessageIndex < THINKING_MESSAGES.length && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse" />
            <span className="text-xs italic">Thinking...</span>
          </div>
        )}
      </div>
    </div>
  );
}

