"use client";

import { useRef, useEffect, useCallback } from "react";
import { useChat, type Message } from "ai/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { MessageBubble } from "@/components/message-bubble";
import { ChatInput } from "@/components/chat-input";
import { ChatHeader } from "@/components/chat-header";
import { LandingState } from "@/components/landing-state";
import { getAuthToken, isAuthenticated } from "@/lib/auth";

const Particles = dynamic(() => import("@/components/backgrounds/Particles"), { ssr: false });

interface ChatWindowProps {
  chatId: string | null;
  onChatCreated?: (id: string, firstMessage: string) => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function ChatWindow({ chatId, onChatCreated, isSidebarOpen, onToggleSidebar }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  const { messages, append, isLoading } = useChat({
    api: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/chat`,
    headers: { Authorization: `Bearer ${getAuthToken() || ""}` },
    id: chatId || undefined,
    body: { id: chatId || undefined }
  });

  const handleSend = async (content: string) => {
    let currentId = chatId;
    if (!currentId && messages.length === 0 && onChatCreated) {
      currentId = crypto.randomUUID();
      onChatCreated(currentId, content);
    }
    append({ id: crypto.randomUUID(), content, role: 'user' }, { options: { body: { id: currentId } } });
  };

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  return (
    <div className="flex flex-col h-full w-full bg-[#030303] relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <Particles particleCount={200} speed={0.1} particleColors={["#ffffff"]} alphaParticles />
      </div>

      <div className="relative z-10 flex flex-col h-full w-full">
        <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={onToggleSidebar} />

        <div className="flex-1 flex flex-col min-h-0 relative">
          {messages.length === 0 ? (
            <LandingState onSend={handleSend} isLoading={isLoading} />
          ) : (
            <>
              <div className="flex-1 overflow-y-auto custom-scrollbar" ref={scrollRef}>
                <div className="px-6 md:px-12 py-8 space-y-8 max-w-5xl mx-auto w-full">
                  {messages.map((msg, i) => (
                    <MessageBubble 
                      key={i} 
                      role={msg.role as any} 
                      content={msg.content} 
                      isStreaming={isLoading && i === messages.length - 1 && msg.role === "assistant"} 
                    />
                  ))}
                  <div className="h-4" />
                </div>
              </div>

              <div className="w-full bg-gradient-to-t from-[#030303] via-[#030303]/80 pt-12 pb-6 px-6 md:px-12">
                <div className="max-w-5xl mx-auto w-full">
                  <ChatInput onSend={handleSend} isLoading={isLoading} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
