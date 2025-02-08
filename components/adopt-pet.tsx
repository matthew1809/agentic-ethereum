'use client';

import { useState, useCallback } from 'react';
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
          <span className="text-zinc-900">🐱</span>
        </div>
      )}
      <div
        className={`rounded-lg p-3 max-w-[80%] ${
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
    <div className="flex flex-col max-w-[768px] mx-auto pb-12 w-full">
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
      <div className="border border-input bg-secondary rounded-lg flex flex-col gap-2 max-w-[768px] w-full mx-auto">
        <input
          value={props.value}
          placeholder="Tell us about your ideal pet..."
          onChange={props.onChange}
          className="border-none outline-none bg-transparent p-4 text-black"
        />

        <div className="flex justify-end mr-2 mb-2">
          <Button type="submit" className="self-end" disabled={props.loading}>
            {props.loading ? (
              <output className="flex justify-center">
                <LoaderCircle className="animate-spin" />
                <span className="sr-only">Loading...</span>
              </output>
            ) : (
              <span>Send</span>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default function AdoptPet() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  return (
    <div className="min-h-screen bg-[#1B1B1B] text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Title Section */}
        <div className="text-center mb-16">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Dog Image */}
          <div className="relative">
            <Image
              src="/dog-matching.png"
              alt="Dog"
              width={600}
              height={600}
              className="w-full h-auto"
              priority
            />
          </div>

          {/* Right Side - Chat Interface */}
          <div className="flex flex-col gap-6">
         
            {/* Chat Area */}
            <div className="bg-zinc-800/50 rounded-xl p-6">
              <div className="min-h-[300px] mb-6">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    Start chatting to find your perfect pet match.
                  </div>
                ) : (
                  <ChatMessages messages={messages} />
                )}
              </div>

              {/* Chat Input */}
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
  );
} 