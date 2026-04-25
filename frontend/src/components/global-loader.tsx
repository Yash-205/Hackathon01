"use client";

import { motion, AnimatePresence } from "motion/react";
import { Brain } from "lucide-react";

interface GlobalLoaderProps {
  isVisible: boolean;
  text?: string;
}

export function GlobalLoader({ isVisible, text = "Loading Fitmate AI..." }: GlobalLoaderProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030303]"
        >
          <div className="relative">
            {/* Pulsing Glow */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-purple-600 rounded-full blur-3xl pointer-events-none"
            />
            
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/40"
            >
              <Brain className="text-white h-12 w-12" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-col items-center gap-4"
          >
            <span className="text-white/60 font-medium tracking-widest uppercase text-xs">
              {text}
            </span>
            <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                animate={{ 
                  x: ["-100%", "100%"]
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-1/2 h-full bg-gradient-to-r from-transparent via-purple-500 to-transparent"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
