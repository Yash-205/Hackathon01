"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Brain } from "lucide-react";
import { MindMap, type MindMapData } from "@/components/mind-map";
import { cn } from "@/lib/utils";

interface MindMapOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  data: MindMapData | null;
  isLoading?: boolean;
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Pulsing central icon */}
      <motion.div
        className="w-28 h-28 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-2xl shadow-purple-500/10"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Brain className="text-purple-400 h-12 w-12" />
      </motion.div>
      <motion.p
        className="text-sm text-white/30 font-medium"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        Generating mind map...
      </motion.p>
      {/* Orbiting dots */}
      <div className="relative w-64 h-64 -mt-36">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor: [
                "#f97066",
                "#22d3ee",
                "#fbbf24",
                "#34d399",
                "#f472b6",
                "#818cf8",
              ][i],
              left: "50%",
              top: "50%",
            }}
            animate={{
              x: [
                Math.cos((i / 6) * Math.PI * 2) * 80,
                Math.cos((i / 6) * Math.PI * 2 + Math.PI) * 80,
                Math.cos((i / 6) * Math.PI * 2) * 80,
              ],
              y: [
                Math.sin((i / 6) * Math.PI * 2) * 80,
                Math.sin((i / 6) * Math.PI * 2 + Math.PI) * 80,
                Math.sin((i / 6) * Math.PI * 2) * 80,
              ],
              opacity: [0.12, 0.18, 0.12],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function MindMapOverlay({
  isOpen,
  onClose,
  data,
  isLoading = false,
}: MindMapOverlayProps) {
  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-200",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      data-testid="mind-map-overlay"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Content container */}
      <div 
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-[95vw] h-[90vh] max-w-7xl rounded-[40px] border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-2xl shadow-2xl overflow-hidden transition-transform duration-300",
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-10"
        )}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-10 py-8 bg-gradient-to-b from-[#0a0a0a] to-transparent">
          <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">
            Mind Map
          </h2>
          <button
            className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 cursor-pointer transition-all"
            data-testid="close-mind-map"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Mind map content */}
        <div className="w-full h-full overflow-hidden">
          {isLoading && (
            <div
              className="w-full h-full flex items-center justify-center bg-[#0a0a0a]"
              data-testid="mind-map-loader"
            >
              <LoadingSkeleton />
            </div>
          )}
          {!isLoading && data && (
            <MindMap data={data} />
          )}
        </div>
      </div>
    </div>
  );
}
