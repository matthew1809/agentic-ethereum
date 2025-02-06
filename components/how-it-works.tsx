'use client'
import { useState } from 'react';
import Image from 'next/image';
import { MapPin, TrendingUp, PieChart, Plus, CheckCircle, DollarSign, Shield } from 'lucide-react';

export default function HowItWorks() {
  const [view, setView] = useState<'donor' | 'shelter'>('donor');

  const donorSteps = [
    {
      icon: <MapPin className="h-6 w-6 text-amber-500" />,
      step: "STEP 1",
      title: "Choose to support all animals in your region",
      description: "Select an area."
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-amber-500" />,
      step: "STEP 2",
      title: "Simulate your impact",
      description: "Before donating, you see how funds will be used."
    },
    {
      icon: <PieChart className="h-6 w-6 text-amber-500" />,
      step: "STEP 3",
      title: "Trust but verify",
      description: "No need to micromanage, but you can check fund distribution anytime."
    }
  ];

  const shelterSteps = [
    {
      icon: <Plus className="h-6 w-6 text-amber-500" />,
      step: "STEP 1",
      title: "Join the program",
      description: "Shelter applies & gets verified."
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-amber-500" />,
      step: "STEP 2",
      title: "Get a dedicated AI agent",
      description: "Agent promotes pets, tracks needs."
    },
    {
      icon: <DollarSign className="h-6 w-6 text-amber-500" />,
      step: "STEP 3",
      title: "Receive smart funding",
      description: "Donations are auto-allocated based on verified needs."
    },
    {
      icon: <Shield className="h-6 w-6 text-amber-500" />,
      step: "STEP 4",
      title: "Help secure more support",
      description: "ZK-proofed data strengthens funding requests."
    }
  ];

  return (
    <div className="bg-[#fef3e3] py-24 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto relative">
        <div className="absolute right-0 top-0 -translate-y-1/4 z-10">
          <Image
            src="/dog-breaking-through-paper.png"
            alt="Happy dog breaking through paper"
            width={400}
            height={400}
            className="object-contain"
          />
        </div>

        <h2 className="text-4xl font-bold text-gray-900 mb-8 max-w-2xl">
          How AI ensures smart funding & adoption
        </h2>
        
        <div className="flex gap-4 mb-12">
          <button
            type="button"
            onClick={() => setView('donor')}
            className={`px-6 py-3 rounded-lg transition-colors ${
              view === 'donor'
                ? 'bg-gray-200'
                : 'hover:bg-gray-100'
            }`}
          >
            I&apos;m a donor
          </button>
          <button
            type="button"
            onClick={() => setView('shelter')}
            className={`px-6 py-3 rounded-lg transition-colors ${
              view === 'shelter'
                ? 'bg-gray-200'
                : 'hover:bg-gray-100'
            }`}
          >
            I&apos;m a shelter
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {(view === 'donor' ? donorSteps : shelterSteps).map((step) => (
            <div
              key={step.title}
              className="bg-white rounded-lg p-6 border border-gray-200 relative"
            >
              {step.icon}
              <div className="mt-4 text-sm text-amber-500">{step.step}</div>
              <h3 className="text-xl font-semibold mt-2">{step.title}</h3>
              <p className="text-gray-600 mt-2">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <a
            href={view === 'donor' ? '/fund-impact' : '/get-ai-agent'}
            className="text-green-700 font-medium hover:underline inline-flex items-center"
          >
            {view === 'donor' ? 'Fund impact' : 'Get an AI agent'} →
          </a>
        </div>
      </div>
    </div>
  );
} 