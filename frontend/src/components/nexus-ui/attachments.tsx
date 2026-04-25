"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { FileIcon, X, Paperclip } from "lucide-react";

import { cn } from "@/lib/utils";

const attachmentVariants = cva(
  "relative flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2 transition-all hover:bg-white/10",
  {
    variants: {
      variant: {
        compact: "w-fit pr-3",
        inline: "w-full",
        full: "w-full flex-col items-start p-4",
      },
    },
    defaultVariants: {
      variant: "compact",
    },
  }
);

interface AttachmentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof attachmentVariants> {
  name: string;
  type?: string;
  progress?: number;
  onRemove?: () => void;
}

function Attachment({
  className,
  variant,
  name,
  type,
  progress,
  onRemove,
  ...props
}: AttachmentProps) {
  const isPdf = type?.toLowerCase().includes("pdf") || name.toLowerCase().endsWith(".pdf");

  return (
    <div className={cn(attachmentVariants({ variant }), "overflow-hidden", className)} {...props}>
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
        isPdf ? "bg-red-500/10 text-red-400" : "bg-purple-500/10 text-purple-400"
      )}>
        <FileIcon className="h-5 w-5" />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-white/90">{name}</span>
          {isPdf && (
            <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-[9px] font-black text-red-400 uppercase tracking-tighter">
              PDF
            </span>
          )}
        </div>
        {type && (
          <span className="text-[10px] text-white/40 font-medium uppercase tracking-[0.1em]">
            {type.split("/")[1] || type}
          </span>
        )}
      </div>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-2 rounded-lg p-1.5 text-white/20 hover:bg-white/10 hover:text-white transition-all"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Progress Bar */}
      {progress !== undefined && progress < 100 && (
        <div className="absolute bottom-0 left-0 h-[2px] bg-purple-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
      )}
    </div>
  );
}

function AttachmentList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-wrap gap-2 p-2", className)}
      {...props}
    />
  );
}

export { Attachment, AttachmentList };
