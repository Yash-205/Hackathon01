"use client";

import { ChatInput } from "@/components/chat-input";
import { Suggestions, Suggestion } from "@/components/nexus-ui/suggestions";

interface LandingStateProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFileUpload?: (file: File) => void;
  isLoading: boolean;
  isUploading?: boolean;
  error?: string;
  attachments?: any[];
  onAttachmentRemove?: (url: string) => void;
}

export function LandingState({ value, onChange, onSubmit, onFileUpload, isLoading, isUploading, error, attachments = [], onAttachmentRemove }: LandingStateProps) {
  const suggestions = [
    "Create an image",
    "Write or edit",
    "Look something up",
    "Help me code"
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 w-full min-h-[400px]">
      <div className="max-w-3xl w-full space-y-12 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
          What can I help you with?
        </h1>
        
        <div className="relative">
          <ChatInput 
            value={value}
            onChange={onChange}
            onSubmit={onSubmit}
            onFileUpload={onFileUpload} 
            isLoading={isLoading} 
            isUploading={isUploading} 
            error={error}
            attachments={attachments}
            onAttachmentRemove={onAttachmentRemove}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Suggestions>
            {suggestions.map((s) => (
              <Suggestion
                key={s}
                value={s}
                onClick={() => {
                  const event = { target: { value: s } } as any;
                  onChange(event);
                  setTimeout(() => {
                    const formEvent = { preventDefault: () => {} } as any;
                    onSubmit(formEvent);
                  }, 0);
                }}
              />
            ))}
          </Suggestions>
        </div>
      </div>
    </div>
  );
}
