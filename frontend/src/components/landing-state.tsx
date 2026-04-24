"use client";

import { ChatInput } from "@/components/chat-input";

interface LandingStateProps {
  onSend: (content: string) => void;
  isLoading: boolean;
}

export function LandingState({ onSend, isLoading }: LandingStateProps) {
  const suggestions = [
    "Create an image",
    "Write or edit",
    "Look something up",
    "Help me code"
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-20">
      <div className="max-w-3xl w-full space-y-12 animate-in fade-in zoom-in duration-700">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center tracking-tight leading-tight">
          What can I help you with?
        </h1>
        
        <div className="relative">
          <ChatInput onSend={onSend} isLoading={isLoading} />
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => onSend(s)}
              className="px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all cursor-pointer backdrop-blur-sm"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
