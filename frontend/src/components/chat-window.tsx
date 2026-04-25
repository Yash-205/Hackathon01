"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, User as UserIcon, Paperclip, Send, Loader2, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getAuthToken, isAuthenticated } from "@/lib/auth";
import { ChatHeader } from "@/components/chat-header";
import { ChatInput } from "@/components/chat-input";
import { Button } from "@/components/ui/button";
import { LandingState } from "@/components/landing-state";
import { MessageBubble } from "@/components/message-bubble";
import { AuthModal } from "@/components/auth-modal";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  chatId: string | null;
  onChatCreated: (id: string, firstMessage: string) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onAuthRequired?: (mode: "login" | "signup") => void;
}

export default function ChatWindow({ 
  chatId, 
  onChatCreated,
  isSidebarOpen,
  onToggleSidebar,
  onAuthRequired 
}: ChatWindowProps) {
  const [activeAttachments, setActiveAttachments] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading, 
    data,
    setMessages
  } = useChat({
    api: "/api/chat",
    headers: {
      "Authorization": `Bearer ${getAuthToken() || ""}`
    },
    id: chatId || sessionId,
    body: {
      id: chatId || sessionId,
    },
    onResponse: (response: Response) => {
      console.log("[useChat] Response received:", response.status);
    },
    onFinish: (message: any) => {
      console.log("[useChat] Stream finished:", message.content?.substring(0, 50) + "...");
      // If this is a new chat, notify the parent to update sidebar and URL
      if (!chatId && messages.length > 0) {
        // Use a generated ID if useChat doesn't expose it reliably in this version
        const generatedId = Math.random().toString(36).substring(7);
        onChatCreated(generatedId, messages[0].content);
      }
    },
    onError: (err: Error) => {
      console.error("[useChat] Error encountered:", err);
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        onAuthRequired?.("login");
      }
    },
    experimental_attachments: true
  } as any);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Reset messages when starting a new chat
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
    }
  }, [chatId, setMessages]);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${getAuthToken()}`
        },
        body: formData,
      });

      if (response.ok) {
        setActiveAttachments(prev => {
          // Deduplicate by name - if file already exists, don't add again
          if (prev.some(f => f.name === file.name)) {
            return prev;
          }
          const fileWithUrl = Object.assign(file, { 
            previewUrl: URL.createObjectURL(file) 
          });
          return [...prev, fileWithUrl];
        });
      } else {
        const data = await response.json();
        setUploadError(data.detail || "Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadError("Upload failed. Check your connection.");
    } finally {
      setIsUploading(false);
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      onAuthRequired?.("signup");
      return;
    }

    const attachments = activeAttachments.map(file => ({
      name: file.name,
      contentType: file.type,
      url: URL.createObjectURL(file)
    }));

    handleSubmit(e, {
      experimental_attachments: attachments,
      body: {
        id: chatId || sessionId
      }
    });
    
    setActiveAttachments([]);
  };

  // Get current status from data chunks
  const status = data && data.length > 0 ? (data[data.length - 1] as any)?.status : null;

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(88,28,135,0.05),transparent_70%)] pointer-events-none" />
      
      <ChatHeader 
        onNewChat={() => setMessages([])} 
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={onToggleSidebar}
        onAuthRequired={onAuthRequired}
      />

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {messages.length === 0 ? (
            <LandingState 
              value={input}
              onChange={handleInputChange}
              onSubmit={onFormSubmit}
              onFileUpload={handleFileUpload}
              isLoading={isLoading}
              isUploading={isUploading}
              error={uploadError || undefined}
              attachments={activeAttachments.map((file: any) => ({ 
                name: file.name, 
                url: file.previewUrl 
              }))}
              onAttachmentRemove={(url) => setActiveAttachments(prev => prev.filter((f: any) => f.previewUrl !== url))}
            />
          ) : (
            <div className="max-w-4xl mx-auto w-full py-8 px-4 md:px-6 space-y-8">
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id || index}
                  role={message.role as any}
                  content={message.content}
                  attachments={message.experimental_attachments}
                  isStreaming={isLoading && index === messages.length - 1 && message.role === "assistant"}
                />
              ))}

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-start gap-4 animate-in fade-in duration-300">
                  <div className="w-8 h-8 rounded-full bg-white/10 text-purple-400 border border-white/10 flex items-center justify-center shrink-0">
                    <Brain className="h-4 w-4" />
                  </div>
                  <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-[24px] rounded-tl-none backdrop-blur-md">
                    <div className="flex gap-1.5 py-1">
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4 }} className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Fixed Status Pill */}
        {status && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl shadow-2xl z-20">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em]">
              {status}
            </span>
          </div>
        )}

        {messages.length > 0 && (
          <div className="pb-4">
            <ChatInput
              value={input}
              onChange={handleInputChange}
              onSubmit={onFormSubmit}
              onFileUpload={handleFileUpload}
              attachments={activeAttachments.map((file: any) => ({ 
                name: file.name, 
                url: file.previewUrl 
              }))}
              onAttachmentRemove={(url) => setActiveAttachments(prev => prev.filter((f: any) => f.previewUrl !== url))}
              isLoading={isLoading}
              isUploading={isUploading}
              error={uploadError || undefined}
            />
          </div>
        )}
      </main>
    </div>
  );
}
