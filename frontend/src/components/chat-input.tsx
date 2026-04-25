"use client";

import { useRef, useState, useEffect } from "react";
import { Paperclip, Send, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFileUpload?: (file: File) => void;
  attachments?: any[];
  onAttachmentRemove?: (url: string) => void;
  isLoading: boolean;
  isUploading?: boolean;
  error?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onFileUpload,
  attachments = [],
  onAttachmentRemove,
  isLoading,
  isUploading,
  error
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isLoading) return;
    onSubmit(e);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 p-4 md:p-6">
      <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto w-full">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((file) => (
              <div 
                key={file.url} 
                className="flex items-center gap-3 bg-white/5 border border-purple-500/30 rounded-2xl p-2 pr-4 group animate-in fade-in zoom-in duration-300 relative min-w-[200px] shadow-lg shadow-purple-500/5 hover:border-purple-500/50 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-1 ring-white/20">
                  <Paperclip className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-white truncate pr-2">{file.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Context:</span>
                    <span className="text-[9px] font-medium text-white/40 uppercase bg-white/5 px-1 rounded-sm">Ready</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onAttachmentRemove?.(file.url)}
                  className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-[#1a1a1a] border border-white/10 text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {!isUploading && !error && attachments.length > 0 && (
           <div className="mb-3 px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-bold text-green-400 uppercase tracking-wider animate-in fade-in slide-in-from-top-1 inline-flex items-center gap-2">
             <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
             Knowledge Base Updated
           </div>
        )}

        {error && (
          <div className="mb-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 animate-in fade-in slide-in-from-top-1">
            {error}
          </div>
        )}

        <div className="relative flex items-center bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[28px] shadow-2xl shadow-purple-500/5 transition-all focus-within:ring-1 focus-within:ring-purple-500/30 px-2 py-1.5 min-h-[56px]">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-all ml-1"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isUploading}
          >
            <Paperclip className={cn("h-5 w-5", isUploading && "animate-pulse")} />
          </Button>

          <textarea
            ref={textareaRef}
            id="chat-message-input"
            rows={1}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            disabled={isLoading}
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none text-sm text-white placeholder:text-white/20 px-3 py-3 max-h-[200px] outline-none"
          />

          <Button
            type="submit"
            size="icon"
            data-testid="chat-input-button"
            className={cn(
              "h-10 w-10 shrink-0 rounded-full bg-purple-600 text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500 transition-all mr-1 flex items-center justify-center",
              (!value.trim() || isLoading) && "opacity-50 cursor-not-allowed"
            )}
            disabled={!value.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          data-testid="file-upload-input"
          accept=".pdf,.txt,.doc,.docx"
        />
      </form>
      <p className="text-[10px] text-center text-white/20 font-medium uppercase tracking-[0.2em]">
        AI can make mistakes. Verify important info.
      </p>
    </div>
  );
}
