"use client";

import { MessageSquare, Plus, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  chats: { id: string; title: string }[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
}

export function Sidebar({
  isOpen,
  onToggle,
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Content */}
      <div
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 flex flex-col w-64 bg-[#0a0a0a] border-r border-white/5 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden md:border-none"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5 min-w-64">
          <button
            onClick={onNewChat}
            className="flex-1 flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
          >
            <Plus className="h-4 w-4" />
            New chat
          </button>
          <button 
            onClick={onToggle}
            className="ml-2 p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 min-w-64">
          <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 px-2">
            Recent
          </div>
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors group text-left truncate",
                currentChatId === chat.id
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <MessageSquare className="h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100" />
              <span className="truncate">{chat.title}</span>
            </button>
          ))}
          {chats.length === 0 && (
            <div className="text-center text-sm text-white/30 py-4">
              No chats yet
            </div>
          )}
        </div>
      </div>
    </>
  );
}
