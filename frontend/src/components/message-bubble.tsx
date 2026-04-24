"use client";

import { useState } from "react";
import { Bot, User, Sparkles, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MindMapOverlay } from "@/components/mind-map-overlay";
import { getAuthToken } from "@/lib/auth";
import type { MindMapData } from "@/components/mind-map";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === "user";
  const [mindMapOpen, setMindMapOpen] = useState(false);
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [mindMapLoading, setMindMapLoading] = useState(false);

  const showMindMapButton = !isUser && !isStreaming && content.length > 100;

  const handleGenerateMindMap = async () => {
    setMindMapOpen(true);
    setMindMapLoading(true);
    setMindMapData(null);

    try {
      const token = getAuthToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/mindmap`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
          body: JSON.stringify({ text: content }),
        }
      );

      if (!res.ok) throw new Error("Failed to generate mind map");

      const data = await res.json();
      setMindMapData(data);
    } catch (err) {
      console.error("Mind map generation failed:", err);
      // Show a fallback mind map
      setMindMapData({
        central_topic: "Error",
        nodes: [
          {
            id: "1",
            label: "Generation Failed",
            detail: "Could not generate the mind map. Please try again.",
            color: "#f97066",
          },
        ],
      });
    } finally {
      setMindMapLoading(false);
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
            <p className="whitespace-pre-wrap break-words">
              {content}
              {isStreaming && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-current animate-pulse rounded-full align-middle" />
              )}
            </p>
          </div>

          {/* Generate Mind Map button */}
          {showMindMapButton && (
            <motion.button
              className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white/80 hover:bg-white/10 hover:border-purple-500/30 cursor-pointer backdrop-blur-sm"
              onClick={handleGenerateMindMap}
              disabled={mindMapLoading}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              id="generate-mindmap-button"
            >
              {mindMapLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              Generate Mind Map
            </motion.button>
          )}
        </div>
      </div>

      {/* Mind Map Overlay */}
      <MindMapOverlay
        isOpen={mindMapOpen}
        onClose={() => setMindMapOpen(false)}
        data={mindMapData}
        isLoading={mindMapLoading}
      />
    </>
  );
}
