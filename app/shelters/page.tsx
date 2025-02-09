'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';

interface Shelter {
  id: string;
  name: string;
  location: string;
  metrics: {
    currentAnimals: number;
    monthlyIntake: number;
    neuteringCount: number;
    adoptionRate: number;
  };
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

function ChatMessageBubble({ message, isAgent }: { message: Message; isAgent?: boolean }) {
  return (
    <div className={`flex items-start gap-3 mb-4 ${isAgent ? '' : 'flex-row-reverse'}`}>
      <div className={`rounded-lg p-3 text-white break-words max-w-[85%] ${isAgent ? 'bg-zinc-800' : 'bg-green-600'}`}>
        {message.content}
      </div>
    </div>
  );
}

export default function SheltersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShelterId, setSelectedShelterId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sheltersResponse = await fetch('/api/shelters');
        if (!sheltersResponse.ok) throw new Error('Failed to fetch shelters');
        const sheltersData = await sheltersResponse.json();
        setShelters(sheltersData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const selectedShelter = shelters.find(shelter => shelter.id === selectedShelterId);

  // Add filtered shelters logic
  const filteredShelters = shelters.filter(shelter => 
    shelter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shelter.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !selectedShelterId) return;

    setIsResponding(true);
    setHasUserSentMessage(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: chatMessage
    };
    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage('');

    try {
      // Add disclaimer for tweet requests
      if (chatMessage.toLowerCase().includes('tweet')) {
        const disclaimerMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Note: In production, tweeting functionality is restricted to verified shelter administrators only. For this demo, I will proceed with the tweet request.'
        };
        setChatHistory(prev => [...prev, disclaimerMessage]);
      }

      const response = await fetch(`/api/shelters/${selectedShelterId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatMessage,
          shelterId: selectedShelterId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream available');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: ''
      };
      setChatHistory(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        setChatHistory(prev => {
          const lastMessage = prev[prev.length - 1];
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, content: lastMessage.content + text }
          ];
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatHistory(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your message. Please try again.'
        }
      ]);
    } finally {
      setIsResponding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <LoaderCircle className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-gray-400">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4 bg-amber-500 hover:bg-amber-600 text-black">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-4 text-white">Find a shelter near you</h1>
        <p className="text-gray-400 mb-8">Search for shelters by name or location. Chat with their AI assistant to learn about adoptions, donations, and more.</p>
        
        <div className="flex gap-4 mb-8">
          <Input
            type="text"
            placeholder="Search by name or location"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-[300px] bg-zinc-900 border-none text-white placeholder:text-gray-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {filteredShelters.map(shelter => (
              <Card
                key={shelter.id}
                className={`p-6 cursor-pointer transition-colors bg-zinc-900 border-none hover:bg-zinc-800 text-white ${
                  selectedShelterId === shelter.id ? 'ring-2 ring-amber-500' : ''
                }`}
                onClick={() => setSelectedShelterId(shelter.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold">{shelter.name}</h2>
                  <span className="text-2xl">🐾</span>
                </div>
                <p className="text-gray-400 text-sm mb-5">{shelter.location}</p>
                <div className="grid grid-cols-2 gap-y-3 text-sm mb-5">
                  <div>
                    <span className="text-gray-400">Current animals: </span>
                    <span className="font-semibold text-white">{shelter.metrics.currentAnimals}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Monthly intake: </span>
                    <span className="font-semibold text-white">{shelter.metrics.monthlyIntake}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Neutering count: </span>
                    <span className="font-semibold text-white">{shelter.metrics.neuteringCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Adoption rate: </span>
                    <span className="font-semibold text-white">{(shelter.metrics.adoptionRate * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black">Chat</Button>
              </Card>
            ))}
          </div>

          <div className="bg-zinc-900 rounded-lg p-6">
            {selectedShelter ? (
              <>
                <h2 className="text-xl font-semibold mb-4 text-white">Chat with {selectedShelter.name}&apos;s AI assistant</h2>
                <div 
                  ref={chatContainerRef}
                  className="h-[400px] overflow-y-auto mb-4 space-y-4 pr-4 scroll-smooth"
                >
                  {!hasUserSentMessage && (
                    <>
                      <div className="bg-green-600 rounded-lg p-3 ml-auto text-white max-w-[85%] break-words">
                        Hi!
                      </div>
                      <div className="bg-zinc-800 rounded-lg p-3 text-white break-words">
                        Hello! I can help with:
                        <ul className="mt-2 space-y-1">
                          <li>• Available animals for adoption</li>
                          <li>• How to donate & support the shelter</li>
                          <li>• General shelter info</li>
                        </ul>
                        Let me know what you&apos;d like to do!
                      </div>
                    </>
                  )}
                  {chatHistory.map((msg) => (
                    <ChatMessageBubble
                      key={msg.id}
                      message={msg}
                      isAgent={msg.role === 'assistant'}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder={isResponding ? "AI assistant is thinking..." : "Type your message here..."}
                    disabled={isResponding}
                    className="flex-1 bg-zinc-950 border-none text-white placeholder:text-gray-400 disabled:opacity-50"
                    onKeyPress={(e) => e.key === 'Enter' && !isResponding && handleSendMessage()}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={isResponding}
                    className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                  >
                    {isResponding ? (
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                    ) : (
                      'Send'
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[500px] text-gray-400">
                <p>Select a shelter to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 