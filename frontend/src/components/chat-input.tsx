"use client";

import { useState, useRef, useEffect } from "react";
import { SendHorizonal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl focus-within:border-purple-500/50 focus-within:ring-4 focus-within:ring-purple-500/10 transition-all duration-300"
      id="chat-input-form"
    >
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask me anything..."
        disabled={isLoading}
        className="flex-1 bg-transparent dark:bg-transparent border-0 h-14 pl-6 pr-14 text-base text-white focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/40 rounded-2xl"
        id="chat-message-input"
        autoComplete="off"
      />
      <Button
        type="submit"
        size="icon"
        disabled={isLoading || !value.trim()}
        className="absolute right-2 h-10 w-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg disabled:bg-purple-600/30 disabled:text-white/30 transition-all duration-200"
        id="chat-send-button"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <SendHorizonal className="h-5 w-5" />
        )}
      </Button>
    </form>
  );
}
