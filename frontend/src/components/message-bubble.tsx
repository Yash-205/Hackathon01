"use client";

import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className="h-10 w-10 shrink-0 border border-white/10 shadow-lg">
        <AvatarFallback
          className={cn(
            "text-xs",
            isUser
              ? "bg-purple-600 text-white"
              : "bg-white/10 text-white/70"
          )}
        >
          {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "max-w-[85%] md:max-w-[75%] rounded-2xl px-6 py-4 text-base leading-relaxed shadow-2xl",
          isUser
            ? "bg-purple-600 text-white rounded-tr-sm shadow-purple-500/20"
            : "bg-white/5 text-white/90 border border-white/10 rounded-tl-sm backdrop-blur-md"
        )}
      >
        <p className="whitespace-pre-wrap break-words">
          {content}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-1 bg-current animate-pulse rounded-full align-middle" />
          )}
        </p>
      </div>
    </div>
  );
}
