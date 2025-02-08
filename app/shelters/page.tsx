'use client';

import { useState, useEffect } from 'react';
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
    <div
      className={`flex items-start gap-3 mb-4 ${
        isAgent ? '' : 'flex-row-reverse'
      }`}
    >
      {isAgent && (
        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
          <span className="text-zinc-900">🏠</span>
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

export default function SheltersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShelterId, setSelectedShelterId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const response = await fetch('/api/shelters');
        if (!response.ok) throw new Error('Failed to fetch shelters');
        const data = await response.json();
        setShelters(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchShelters();
  }, []);

  // const filteredShelters = shelters.filter(shelter =>
  //   shelter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   shelter.location.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  const selectedShelter = shelters.find(shelter => shelter.id === selectedShelterId);
  console.log('selectedShelter', selectedShelter);

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !selectedShelterId) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: chatMessage
    };
    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage('');

    try {
      console.log('Sending message to:', selectedShelterId);
      const response = await fetch(`/api/shelters/${selectedShelterId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatMessage
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream available');

      // Create a message for the assistant's response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: ''
      };
      setChatHistory(prev => [...prev, assistantMessage]);

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode and append the chunk
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
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderCircle className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Find a Shelter</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Input
            type="text"
            placeholder="Search shelters by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />

          <div className="space-y-4">
            {shelters.map(shelter => (
              <Card
                key={shelter.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedShelterId === shelter.id ? 'border-amber-500' : ''
                }`}
                onClick={() => setSelectedShelterId(shelter.id)}
              >
                <h2 className="text-xl font-semibold">{shelter.name}</h2>
                <p className="text-gray-600">{shelter.location}</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Animals</p>
                    <p className="font-semibold">{shelter.metrics.currentAnimals}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monthly Intake</p>
                    <p className="font-semibold">{shelter.metrics.monthlyIntake}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Neutering Count</p>
                    <p className="font-semibold">{shelter.metrics.neuteringCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Adoption Rate</p>
                    <p className="font-semibold">{(shelter.metrics.adoptionRate * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          {selectedShelter ? (
            <div className="border rounded-lg p-4">
              <h2 className="text-2xl font-bold mb-4">Chat with {selectedShelter.name}</h2>
              
              <div className="h-96 overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 rounded">
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
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>Send</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Select a shelter to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 