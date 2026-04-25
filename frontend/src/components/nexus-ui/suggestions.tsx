"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { HTMLMotionProps, motion } from "motion/react";

interface SuggestionsProps extends React.HTMLAttributes<HTMLDivElement> {
  onSuggestionSelect?: (value: string) => void;
}

function Suggestions({
  className,
  onSuggestionSelect: _onSuggestionSelect,
  children,
  ...props
}: SuggestionsProps) {
  return (
    <div
      className={cn("flex flex-wrap justify-center gap-3 p-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface SuggestionProps extends HTMLMotionProps<"button"> {
  value: string;
}

function Suggestion({
  className,
  value,
  children,
  ...props
}: SuggestionProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all cursor-pointer backdrop-blur-sm",
        className
      )}
      {...props}
    >
      {children || value}
    </motion.button>
  );
}

export { Suggestions, Suggestion };
