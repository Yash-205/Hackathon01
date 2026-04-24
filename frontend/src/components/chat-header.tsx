"use client";

import { MessageCircle, PanelLeftOpen, LogOut } from "lucide-react";
import { removeAuthToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface ChatHeaderProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function ChatHeader({ isSidebarOpen, onToggleSidebar }: ChatHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4 px-6 py-6 md:px-12 bg-transparent sticky top-0 z-20">
      {!isSidebarOpen && onToggleSidebar && (
        <button 
          onClick={onToggleSidebar}
          className="p-2.5 -ml-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 backdrop-blur-md"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </button>
      )}
      <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-400 shadow-2xl shadow-purple-500/5 border border-purple-500/20">
        <MessageCircle className="h-6 w-6" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">AI Assistant</h1>
        <p className="text-sm text-purple-400/60 font-medium">Powered by LangGraph</p>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
          </span>
          <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Online</span>
        </div>
        <button 
          onClick={() => {
            removeAuthToken();
            router.push("/login");
          }}
          className="p-2.5 text-white/40 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-xl transition-all border border-white/10 group"
          title="Logout"
        >
          <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
}
