"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";

interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  role: "user" | "assistant";
  avatar?: React.ReactNode;
}

function Message({
  className,
  role,
  avatar,
  children,
  ...props
}: MessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "group relative flex w-full gap-4 p-4 transition-colors",
        isUser ? "flex-row-reverse" : "flex-row",
        className
      )}
      {...props}
    >
      <div className="flex shrink-0 items-start pt-1">
        {avatar || (
          <Avatar className="h-9 w-9 border border-white/10">
            <AvatarFallback className={isUser ? "bg-purple-600" : "bg-white/10"}>
              {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      <div className={cn(
        "flex flex-col gap-2 max-w-[85%] md:max-w-[75%]",
        isUser ? "items-end text-right" : "items-start text-left"
      )}>
        <div className={cn(
          "rounded-2xl px-5 py-3.5 text-base leading-relaxed",
          isUser 
            ? "bg-purple-600 text-white rounded-tr-sm shadow-xl shadow-purple-950/20" 
            : "bg-white/5 text-white/90 border border-white/10 rounded-tl-sm backdrop-blur-md"
        )}>
          {children}
        </div>
      </div>
    </div>
  );
}

export { Message };
