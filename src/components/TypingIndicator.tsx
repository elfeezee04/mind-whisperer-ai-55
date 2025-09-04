import React from 'react';
import { Card } from '@/components/ui/card';
import { Bot } from 'lucide-react';

export const TypingIndicator = () => {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="flex max-w-[80%] gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
          <Bot className="h-4 w-4 text-accent-foreground" />
        </div>

        {/* Typing Bubble */}
        <Card className="p-4 bg-chat-bubble-ai border-border/50 shadow-gentle">
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-typing-dots rounded-full animate-typing"></div>
              <div className="w-2 h-2 bg-typing-dots rounded-full animate-typing" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-typing-dots rounded-full animate-typing" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-xs text-muted-foreground ml-2">typing...</span>
          </div>
        </Card>
      </div>
    </div>
  );
};