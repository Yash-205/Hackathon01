"use client";

import { useState, useEffect } from "react";
import ChatWindow from "@/components/chat-window";
import { Sidebar } from "@/components/sidebar";
import { GlobalLoader } from "@/components/global-loader";
import { getAuthToken, isAuthenticated } from "@/lib/auth";

import { AuthModal } from "@/components/auth-modal";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [newChatKey, setNewChatKey] = useState(0);
  const [chats, setChats] = useState<{ id: string; title: string }[]>([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: "login" | "signup" }>({
    open: false,
    mode: "login"
  });

  const handleAuthRequired = (mode: "login" | "signup" = "signup") => {
    setAuthModal({ open: true, mode });
  };

  const fetchThreads = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      const response = await fetch('/api/threads', {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (err) {
      console.error("Failed to fetch threads:", err);
    }
  };

  useEffect(() => {
    // Check authentication on mount
    if (isAuthenticated()) {
      fetchThreads();
    }
    setAuthChecked(true);
  }, []);

  const handleToggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleNewChat = () => {
    setCurrentChatId(null);
    setNewChatKey(prev => prev + 1);
    setIsSidebarOpen(false); // Close on mobile
  };

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
    setIsSidebarOpen(false); // Close on mobile
  };

  const handleChatCreated = async (id: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 30) + (firstMessage.length > 30 ? "..." : "");
    const newChat = { id, title };
    setChats([newChat, ...chats]);
    setCurrentChatId(id);

    // Persist to backend
    try {
      const token = getAuthToken();
      if (!token) return;

      await fetch('/api/threads', {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newChat)
      });
    } catch (err) {
      console.error("Failed to persist thread:", err);
    }
  };

  if (!authChecked) {
    return <GlobalLoader isVisible={true} />;
  }

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
          key={newChatKey}
          chatId={currentChatId} 
          onChatCreated={handleChatCreated}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          onAuthRequired={handleAuthRequired}
        />
      </div>

      <AuthModal 
        key={authModal.mode}
        isOpen={authModal.open} 
        onClose={() => setAuthModal({ ...authModal, open: false })} 
        initialMode={authModal.mode} 
      />
    </main>
  );
}
