
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, X, Send, Loader2, BotIcon, User as UserIconLucide } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getChatbotRules } from '@/services/chatbotRuleService';
import type { ChatbotRule } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card'; 

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export function RuleBasedChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoadingRules, setIsLoadingRules] = useState(false);
  const [rules, setRules] = useState<ChatbotRule[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    // Fetch rules when the component mounts
    setIsLoadingRules(true);
    getChatbotRules()
      .then(fetchedRules => {
        setRules(fetchedRules);
        // Add initial greeting message after rules are potentially loaded
        setMessages([{ id: Date.now().toString(), text: "Hello! How can I help you today?", sender: 'bot' }]);
      })
      .catch(error => {
        console.error("Failed to load chatbot rules:", error);
        setMessages([{ id: Date.now().toString(), text: "Sorry, I couldn't load my knowledge base. Please try again later.", sender: 'bot' }]);
      })
      .finally(() => {
        setIsLoadingRules(false);
      });
  }, []); // Empty dependency array to run only on mount

  const getBotResponse = (userInput: string): string => {
    if (isLoadingRules) {
      return "I'm currently loading my responses, please wait a moment...";
    }
    if (rules.length === 0) {
      return "I don't have any specific rules loaded right now. You can ask general questions or contact support.";
    }

    const lowerInput = userInput.toLowerCase().trim();
    if (!lowerInput) return "Please type a question.";

    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      if (rule.keywords.some(keyword => lowerInput.includes(keyword.toLowerCase()))) {
        return rule.response;
      }
    }
    return "I'm not sure how to answer that. Can you try rephrasing, or ask about our services, projects, or contact information?";
  };

  const handleSendMessage = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    const newUserMessage: ChatMessage = { id: Date.now().toString(), text: trimmedInput, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    
    setTimeout(() => {
      const botResponseText = getBotResponse(trimmedInput);
      const newBotMessage: ChatMessage = { id: (Date.now() + 1).toString(), text: botResponseText, sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, newBotMessage]);
    }, 500);
    
    setInputValue('');
  };

  return (
    <Card className="w-full h-full flex flex-col shadow-none border-none">
      <CardHeader className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground flex items-center">
            <BotIcon className="h-6 w-6 mr-2 text-primary"/> ByteBrusters Assistant
        </h3>
      </CardHeader>

      <ScrollArea className="flex-1 p-4 space-y-3 bg-muted/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex items-end space-x-2 max-w-[85%]",
              msg.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : 'mr-auto'
            )}
          >
            {msg.sender === 'bot' && <BotIcon className="h-6 w-6 text-primary flex-shrink-0 mb-1" />}
            {msg.sender === 'user' && <UserIconLucide className="h-6 w-6 text-accent flex-shrink-0 mb-1" />}
            <div
              className={cn(
                "p-3 rounded-lg text-sm shadow",
                msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-muted text-muted-foreground rounded-bl-none'
              )}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-border flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 bg-input focus-visible:ring-primary"
          disabled={isLoadingRules}
        />
        <Button type="submit" size="icon" className="button-primary" disabled={!inputValue.trim() || isLoadingRules}>
          {isLoadingRules ? <Loader2 className="h-5 w-5 animate-spin"/> : <Send className="h-5 w-5" />}
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </Card>
  );
}
