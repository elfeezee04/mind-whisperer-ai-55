import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Heart, LogOut, User } from 'lucide-react';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export const ChatBot = () => {
  const { user, signOut } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hello! I'm here to listen and support you. How are you feeling today? Remember, this is a safe space where you can share whatever is on your mind. 💙",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-gemini', {
        body: { 
          message: inputValue.trim(),
          userId: user?.id 
        }
      });

      if (error) throw error;
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast({
        title: "Connection Error",
        description: "I'm having trouble connecting right now. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickResponses = [
    "I'm feeling anxious",
    "I need someone to talk to",
    "I'm having a hard day",
    "I want to feel better"
  ];

  const handleQuickResponse = (response: string) => {
    setInputValue(response);
  };

  return (
    <div className="flex flex-col h-screen bg-calm-gradient">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">MindfulChat</h1>
                <p className="text-sm text-muted-foreground">Your compassionate AI companion</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            
            {isTyping && <TypingIndicator />}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Quick Responses */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground mb-3">Quick responses:</p>
            <div className="flex flex-wrap gap-2">
              {quickResponses.map((response) => (
                <Button
                  key={response}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickResponse(response)}
                  className="bg-card/50 border-border/50 hover:bg-accent/50"
                >
                  {response}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-card/80 backdrop-blur-sm border-t border-border/50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind... I'm here to listen"
              className="flex-1 bg-background/50"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};