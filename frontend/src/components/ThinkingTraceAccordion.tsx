import { useState } from 'react';
import { ChevronDown, Brain, Sparkles } from 'lucide-react';

interface ThinkingTraceAccordionProps {
  thinkingTrace: string;
}

export function ThinkingTraceAccordion({ thinkingTrace }: ThinkingTraceAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Brain className="w-5 h-5 text-youtube-red" />
            <Sparkles className="w-3 h-3 text-youtube-red absolute -top-0.5 -right-0.5" />
          </div>
          <span className="font-semibold text-white">Reveal AI Logic</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isExpanded ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      
      {isExpanded && (
        <div className="border-t border-gray-800 p-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-md p-4">
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {thinkingTrace}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

