"use client";

import { useState } from "react";
import { Bot, User, Sparkles, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MindMapOverlay } from "@/components/mind-map-overlay";
import { getAuthToken } from "@/lib/auth";
import type { MindMapData } from "@/components/mind-map";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  attachments?: any[];
  onGenerateMindMap?: (content: string) => void;
}

export function MessageBubble({ 
  role, 
  content, 
  isStreaming, 
  attachments,
  onGenerateMindMap 
}: MessageBubbleProps) {
  const isUser = role === "user";

  const showMindMapButton = !isUser && !isStreaming && content.length > 100;

  const handleGenerateMindMap = () => {
    if (onGenerateMindMap) {
      onGenerateMindMap(content);
    }
  };

  return (
    <>
      <div
        className={cn(
          "flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        <Avatar className="h-10 w-10 shrink-0 border border-white/10 shadow-lg">
          <AvatarFallback
            className={cn(
              "text-xs",
              isUser
                ? "bg-purple-600 text-white"
                : "bg-white/10 text-white/70"
            )}
          >
            {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-2 max-w-[85%] md:max-w-[75%]">
          <div
            className={cn(
              "rounded-2xl px-6 py-4 text-base leading-relaxed shadow-2xl",
              isUser
                ? "bg-purple-600 text-white rounded-tr-sm shadow-purple-500/20"
                : "bg-white/5 text-white/90 border border-white/10 rounded-tl-sm backdrop-blur-md"
            )}
          >

            <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <div className="mb-4 last:mb-0 whitespace-pre-wrap break-words">{children}</div>,
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline ? (
                      <div className="relative group my-4">
                        <pre className="overflow-x-auto p-4 rounded-xl bg-black/40 border border-white/10 text-sm font-mono text-purple-200/90 shadow-inner scrollbar-thin scrollbar-thumb-white/10">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                        {match && (
                          <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/30 uppercase font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                            {match[1]}
                          </div>
                        )}
                      </div>
                    ) : (
                      <code className="px-1.5 py-0.5 rounded-md bg-white/10 text-purple-300 font-mono text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                  ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-white/80">{children}</li>,
                  h1: ({ children }) => <h1 className="text-xl font-bold mb-4 text-white">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-bold mb-3 text-white/90">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-bold mb-2 text-white/80">{children}</h3>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-purple-500/50 pl-4 py-1 my-4 italic text-white/60 bg-purple-500/5 rounded-r-lg">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-1 h-4 ml-1.5 bg-purple-500 animate-pulse rounded-full align-middle shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
              )}
            </div>
          </div>

          {/* Generate Mind Map button */}
          {showMindMapButton && (
            <motion.button
              className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white/80 hover:bg-white/10 hover:border-purple-500/30 cursor-pointer backdrop-blur-sm mt-2"
              onClick={handleGenerateMindMap}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              data-testid="generate-mindmap-button"
            >
              <Sparkles className="h-3 w-3" />
              Generate Mind Map
            </motion.button>
          )}

          {attachments && attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {attachments.map((file: any, idx: number) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2 shadow-sm hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-white/90 truncate max-w-[150px]">
                      {file.name || "Document"}
                    </span>
                    <span className="text-[10px] text-white/30 uppercase font-bold tracking-tight">
                      PDF Document
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </>
  );
}
