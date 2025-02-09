'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/utils/cn";

// Message type for chat
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

function ChatMessageBubble({ message, isAgent }: { message: Message; isAgent?: boolean }) {
  return (
    <div
      className={`flex items-start gap-3 mb-4 ${
        isAgent ? '' : 'flex-row-reverse'
      }`}
    >
      {isAgent && (
        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
          <span role="img" aria-label="paw emoji" className="text-zinc-900">🐾</span>
        </div>
      )}
      <div
        className={`rounded-lg p-4 max-w-[85%] ${
          isAgent ? 'bg-zinc-700' : 'bg-amber-500 text-zinc-900'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

function ChatMessages({ messages }: { messages: Message[] }) {
  return (
    <div className="flex flex-col w-full space-y-4">
      {messages.map((m) => (
        <ChatMessageBubble
          key={m.id}
          message={m}
          isAgent={m.role === 'assistant'}
        />
      ))}
    </div>
  );
}

function ChatInput(props: {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
  className?: string;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.stopPropagation();
        e.preventDefault();
        props.onSubmit(e);
      }}
      className={cn("flex w-full flex-col", props.className)}
    >
      <div className="relative">
        <input
          value={props.value}
          placeholder="Message our AI onboarding agent"
          onChange={props.onChange}
          className="w-full bg-[#1B1B1B] rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <Button 
          type="submit" 
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg" 
          disabled={props.loading}
        >
          {props.loading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            'Send'
          )}
        </Button>
      </div>
    </form>
  );
}

export default function AdoptPet() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setHasUserSentMessage(true);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('/api/adopt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream available');

      // Create a message for the assistant's response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: ''
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode and append the chunk
        const text = new TextDecoder().decode(value);
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, content: lastMessage.content + text }
          ];
        });
      }
    } catch (e) {
      console.error('Chat error:', e);
      // Add error message to chat
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  return (
    <div className="min-h-screen bg-[#1B1B1B] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl lg:text-7xl font-bold mb-6">
            Find your <span className="text-amber-500">perfect</span> pet<br />
            companion.
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Our AI-powered adoption system learns about your preferences and finds pets
            that suit your lifestyle.
          </p>
        </div>

        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start max-w-7xl mx-auto">
          {/* Left Side - Dog Image */}
          <div className="relative lg:sticky lg:top-4">
            <Image
              src="/dog-matching.png"
              alt="Dog looking up expectantly"
              width={600}
              height={600}
              className="w-full h-auto"
              priority
            />
          </div>

          {/* Right Side - Chat Interface */}
          <div className="flex flex-col">
            <div className="bg-[#1B1B1B] rounded-lg border border-zinc-800">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
                <span role="img" aria-label="paw emoji" className="text-amber-500">🐾</span>
                <span>Let&apos;s find your perfect pet</span>
              </div>
              <div 
                ref={chatContainerRef}
                className="min-h-[400px] max-h-[600px] overflow-y-auto p-4 space-y-4"
              >
                {!hasUserSentMessage ? (
                  <div className="flex justify-end">
                    <Button className="bg-green-600 hover:bg-green-700 text-white px-6">
                      Chat to get started
                    </Button>
                  </div>
                ) : (
                  <ChatMessages messages={messages} />
                )}
              </div>

              <div className="p-4 border-t border-zinc-800">
                <ChatInput
                  value={input}
                  onChange={handleInputChange}
                  onSubmit={handleSubmit}
                  loading={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 