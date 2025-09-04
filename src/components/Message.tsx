import React from 'react';
import { Card } from '@/components/ui/card';
import { User, Bot } from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface MessageProps {
  message: ChatMessage;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`flex max-w-[80%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-chat-bubble-user' : 'bg-accent'
        }`}>
          {isUser ? (
            <User className="h-4 w-4 text-chat-bubble-user-foreground" />
          ) : (
            <Bot className="h-4 w-4 text-accent-foreground" />
          )}
        </div>

        {/* Message Bubble */}
        <Card className={`p-4 shadow-gentle ${
          isUser 
            ? 'bg-chat-bubble-user text-chat-bubble-user-foreground border-chat-bubble-user/20' 
            : 'bg-chat-bubble-ai text-chat-bubble-ai-foreground border-border/50'
        }`}>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
          <div className={`text-xs mt-2 opacity-70`}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};