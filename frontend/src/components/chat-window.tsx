"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/message-bubble";
import { ChatInput } from "@/components/chat-input";
import { sendMessage, type Message } from "@/lib/api";

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
 
   const scrollToBottom = useCallback(() => {
     if (isAtBottom && scrollRef.current) {
       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
     }
   }, [isAtBottom]);
 
   useEffect(() => {
     scrollToBottom();
   }, [messages, scrollToBottom]);

   const handleScroll = useCallback(() => {
     if (scrollRef.current) {
       const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
       const atBottom = scrollHeight - scrollTop - clientHeight < 100;
       setIsAtBottom(atBottom);
     }
   }, []);
 
   const handleSend = useCallback(
     async (content: string) => {
       const userMessage: Message = { role: "user", content };
       const updatedMessages = [...messages, userMessage];
 
       setMessages(updatedMessages);
       setIsLoading(true);
 
       const assistantMessage: Message = { role: "assistant", content: "" };
       setMessages([...updatedMessages, assistantMessage]);
 
       try {
         for await (const token of sendMessage(updatedMessages)) {
           assistantMessage.content += token;
           setMessages((prev) => {
             const next = [...prev];
             next[next.length - 1] = { ...assistantMessage };
             return next;
           });
         }
       } catch (error) {
         console.error("Chat error:", error);
         setMessages((prev) => {
           const next = [...prev];
           next[next.length - 1] = {
             role: "assistant",
             content: "Sorry, something went wrong. Please check your connection.",
           };
           return next;
         });
       } finally {
         setIsLoading(false);
       }
     },
     [messages]
   );
 
   return (
     <div className="flex flex-col h-full w-full bg-transparent relative overflow-hidden z-10 pointer-events-auto">
       {/* Header - Fully Transparent & Integrated */}
       <div className="flex items-center gap-4 px-6 py-6 md:px-12 bg-transparent sticky top-0 z-20">
         <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-400 shadow-2xl shadow-purple-500/5 border border-purple-500/20">
           <MessageCircle className="h-6 w-6" />
         </div>
         <div>
           <h1 className="text-xl font-bold text-white tracking-tight">AI Assistant</h1>
           <p className="text-sm text-purple-400/60 font-medium">Powered by LangGraph</p>
         </div>
         <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
           <span className="relative flex h-2 w-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
             <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
           </span>
           <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Online</span>
         </div>
       </div>
 
       {/* Messages */}
       <ScrollArea 
         className="flex-1 min-h-0" 
         ref={scrollRef}
         onScroll={handleScroll}
       >
         <div className="px-6 md:px-12 py-8 space-y-8 max-w-5xl mx-auto w-full">
           {messages.length === 0 && (
             <div className="flex flex-col items-center justify-center py-24 text-center">
               <div className="flex items-center justify-center h-16 w-16 rounded-3xl bg-white/5 text-white/20 mb-6 border border-white/10">
                 <MessageCircle className="h-8 w-8" />
               </div>
               <h2 className="text-2xl font-bold text-white mb-2">
                 Start a conversation
               </h2>
               <p className="text-white/30 max-w-md">
                 Send a message to begin chatting with the AI assistant.
               </p>
             </div>
           )}
 
           {messages.map((msg, i) => (
             <MessageBubble
               key={i}
               role={msg.role as "user" | "assistant"}
               content={msg.content}
               isStreaming={
                 isLoading && i === messages.length - 1 && msg.role === "assistant"
               }
             />
           ))}
         </div>
       </ScrollArea>
 
       {/* Input */}
       <div className="w-full bg-gradient-to-t from-background/90 to-transparent p-4 md:px-12 md:py-8">
         <div className="max-w-5xl mx-auto w-full">
           <ChatInput onSend={handleSend} isLoading={isLoading} />
         </div>
       </div>
     </div>
   );
 }
