"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ThreadProps extends React.HTMLAttributes<HTMLDivElement> {
  autoScroll?: boolean;
}

function Thread({
  className,
  autoScroll = true,
  children,
  ...props
}: ThreadProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (autoScroll && scrollRef.current) {
      const scrollArea = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [children, autoScroll]);

  return (
    <ScrollArea 
      ref={scrollRef}
      className={cn("flex-1 w-full", className)} 
      {...props}
    >
      <div className="flex flex-col py-8 max-w-5xl mx-auto w-full">
        {children}
      </div>
    </ScrollArea>
  );
}

export { Thread };
