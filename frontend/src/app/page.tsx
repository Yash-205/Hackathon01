"use client";

import { useState } from "react";
import { ChatWindow } from "@/components/chat-window";
import { Sidebar } from "@/components/sidebar";
import { PanelLeftOpen } from "lucide-react";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<{ id: string; title: string }[]>([]);

  const handleToggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleNewChat = () => {
    setCurrentChatId(null);
    setIsSidebarOpen(false); // Close on mobile
  };

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
    setIsSidebarOpen(false); // Close on mobile
  };

  const handleChatCreated = (id: string, firstMessage: string) => {
    setChats([{ id, title: firstMessage.slice(0, 30) + "..." }, ...chats]);
    setCurrentChatId(id);
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#030303] flex">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={handleToggleSidebar}
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
      />
      
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <ChatWindow 
          chatId={currentChatId} 
          onChatCreated={handleChatCreated}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
        />
      </div>
    </main>
  );
}
