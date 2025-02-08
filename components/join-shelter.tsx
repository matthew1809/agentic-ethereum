'use client';

import { useState, useCallback, type FormEvent, type ReactNode } from 'react';
import Image from 'next/image';
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { Button } from "@/components/ui/button";
import { ArrowDown, LoaderCircle } from "lucide-react";
import { cn } from "@/utils/cn";

// Simple message type
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
        className={`rounded-2xl p-4 max-w-[80%] ${
          isAgent ? 'bg-zinc-800 text-white' : 'bg-amber-500 text-zinc-900'
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

function ScrollToBottom({ className }: { className?: string }) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  if (isAtBottom) return null;
  return (
    <Button
      variant="outline"
      className={className}
      onClick={() => scrollToBottom()}
    >
      <ArrowDown className="w-4 h-4" />
      <span>Scroll to bottom</span>
    </Button>
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
      <div className="border border-zinc-700 bg-zinc-800 rounded-xl flex flex-col gap-2 max-w-[768px] w-full mx-auto">
        <input
          value={props.value}
          placeholder="Message our AI onboarding agent"
          onChange={props.onChange}
          className="border-none outline-none bg-transparent p-4 text-white placeholder:text-zinc-500"
        />

        <div className="flex justify-end mr-2 mb-2">
          <Button 
            type="submit" 
            className="self-end bg-amber-500 hover:bg-amber-600 text-zinc-900" 
            disabled={props.loading}
          >
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

function StickyToBottomContent(props: {
  content: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const context = useStickToBottomContext();

  return (
    <div
      ref={context.scrollRef}
      style={{ width: "100%", height: "100%" }}
      className={cn("grid grid-rows-[1fr,auto]", props.className)}
    >
      <div ref={context.contentRef} className={props.contentClassName}>
        {props.content}
      </div>

      {props.footer}
    </div>
  );
}

export default function JoinShelter() {
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
      const response = await fetch('/api/intake', {
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
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-12">
          <div className="lg:w-1/3">
            <Image
              src="/dog-breaking-through-paper.png"
              alt="Excited dog breaking through paper"
              width={400}
              height={400}
              priority
              className="rounded-full"
            />
          </div>
          <div className="text-center lg:text-left lg:w-2/3">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Get your shelter onboard<br />
              in <span className="text-amber-500">minutes</span>.
            </h1>
            <p className="text-lg text-zinc-400">
              Our AI onboarding agent will guide you through the process—just chat to get started.
            </p>
          </div>
        </div>

        <StickToBottom>
          <StickyToBottomContent
            className="relative h-[600px] bg-zinc-800/50 rounded-xl border border-zinc-700 mb-16"
            contentClassName="py-12 px-4"
            content={
              messages.length === 0 ? (
                <div className="text-center text-zinc-500">
                  Start chatting to begin the onboarding process.
                </div>
              ) : (
                <ChatMessages messages={messages} />
              )
            }
            footer={
              <div className="sticky bottom-8 px-4">
                <ScrollToBottom className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4" />
                <ChatInput
                  value={input}
                  onChange={handleInputChange}
                  onSubmit={handleSubmit}
                  loading={isLoading}
                />
              </div>
            }
          />
        </StickToBottom>
      </div>
    </div>
  );
} 