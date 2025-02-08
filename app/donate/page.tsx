'use client';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { useState, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CopyIcon, CheckCircle2 } from "lucide-react";
import { addDonor } from "@/lib/data/addDonor";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";

export default function DonatePage() {
  const { primaryWallet, sdkHasLoaded, setShowAuthFlow } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();

  const [showThankYou, setShowThankYou] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState('10');
  const [isMonthly, setIsMonthly] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const donateFormRef = useRef<HTMLDivElement>(null);

  const scrollToDonateForm = () => {
    donateFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const allocationCategories = [
    { name: 'Neutering programs', icon: '🐾' },
    { name: 'Adoption promotion', icon: '📢' },
    { name: 'Medical care', icon: '🏥' },
    { name: 'Behavioral & rehabilitation programs', icon: '🎯' },
    { name: 'Food & nutrition', icon: '🥩' },
    { name: 'Transport & relocation', icon: '🚗' },
    { name: 'Shelter upkeep', icon: '🏠' },
    { name: 'Staff & volunteer training', icon: '👥' },
  ];

  const donationFlow = [
    {
      step: 1,
      title: 'Donations collected',
      icon: '💰',
      details: [
        { text: 'Donations come from AI agents & the main site.' },
        { text: 'Funds flow into a centralized smart contract pot.' }
      ]
    },
    {
      step: 2,
      title: 'Locked in a smart contract',
      icon: '🔒',
      details: [
        { text: 'Ensures fair, secure distribution.' },
        { text: 'Prevents overfunding or misuse.' }
      ]
    },
    {
      step: 3,
      title: 'AI-driven calculation layer',
      icon: '✨',
      details: [
        { text: 'AI analyzes real-time needs & adjusts allocation each month.' }
      ]
    },
    {
      step: 4,
      title: 'Dynamic monthly allocation',
      icon: '⏱️',
      details: [
        { text: 'Winter: more funds for warmth & shelter upkeep.' },
        { text: 'Awareness campaigns: ads against breeders & pet abandonment.' },
        { text: 'Medical & neutering programs: when demand spikes.' },
        { text: 'Food & nutrition: adjusts to shelter intake.' }
      ]
    }
  ];

  const donationOptions = [
    { value: '10', label: '$10', description: 'Provides food for 5 animals.' },
    { value: '50', label: '$50', description: 'Covers medical care for 3 rescues.' },
    { value: '100', label: '$100', description: 'Supports a neutering program.' },
    { value: '500', label: '$500', description: 'Keeps a shelter open for a month.' },
  ];

  const handleDonate = async () => {
    try {
      setError(null);
      setIsProcessing(true);

      const amount = selectedAmount === 'custom' 
        ? Number.parseFloat(customAmount) 
        : Number.parseFloat(selectedAmount);

      if (Number.isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid donation amount');
      }

      // In a real app, you would get the user's name from their wallet or profile
      const donorName = "Anonymous Donor"; // Placeholder
      const durationMonths = isMonthly ? 12 : 0; // Default to 12 months for recurring donations

      await addDonor(donorName, amount, isMonthly, durationMonths);
      
      setShowThankYou(true);
      setTimeout(() => {
        setShowThankYou(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process donation');
    } finally {
      setIsProcessing(false);
    }
  };

  const connectWallet = () => {
    if (!isLoggedIn) {
      setShowAuthFlow(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#1B1B1B] text-white">
      {/* Hero Section */}
      <div className="relative px-4 lg:px-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold leading-tight">
                Give smarter, save more lives.
              </h1>
              <p className="text-lg text-gray-300 max-w-xl">
                Every dollar goes directly into our smart funding system, ensuring shelters get
                exactly what they need—nothing more, nothing less.
              </p>

              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Where donations are allocated</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {allocationCategories.map((category) => (
                      <div key={category.name} className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span className="text-gray-300">{category.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  className="bg-amber-500 hover:bg-amber-600 text-black px-8 py-6"
                  onClick={scrollToDonateForm}
                >
                  Donate now
                </Button>
              </div>
            </div>

            <div className="relative">
              <Image
                src="/cat-donate.png"
                alt="Cat looking up with bright eyes"
                width={600}
                height={800}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Donation Flow Section */}
      <div className="px-4 lg:px-8 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left side - Donation Flow */}
            <div>
              <h2 className="text-3xl font-bold mb-12">How your donation flows</h2>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-green-700" />
                <div className="space-y-12">
                  {donationFlow.map((step) => (
                    <div key={step.step} className="relative pl-12">
                      <div className="absolute left-0 -translate-x-1/2 w-8 h-8 rounded-full bg-green-700 flex items-center justify-center">
                        {step.step}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{step.icon}</span>
                          <h3 className="text-xl font-semibold">{step.title}</h3>
                        </div>
                        <div className="space-y-1 text-gray-300">
                          {step.details.map((detail, i) => (
                            <div key={`${step.step}-${i}`} className="flex items-start gap-2">
                              <span className="text-amber-500">→</span>
                              <p>{detail.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side - Donation Form */}
            <div ref={donateFormRef} className="bg-[#1E1E1E] rounded-lg p-8 space-y-8 scroll-mt-24">

              <div>
                <h3 className="text-2xl font-bold mb-6">Choose your impact</h3>
                <RadioGroup 
                  value={selectedAmount} 
                  onValueChange={setSelectedAmount}
                  className="space-y-3"
                >
                  {donationOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`amount-${option.value}`} />
                      <Label htmlFor={`amount-${option.value}`} className="flex-1">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-gray-400 ml-2">— {option.description}</span>
                      </Label>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="amount-custom" />
                    <Label htmlFor="amount-custom" className="flex items-center gap-2">
                      <span className="font-medium">Custom amount:</span>
                      <Input
                        type="number"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setSelectedAmount('custom');
                        }}
                        className="w-24 bg-[#2A2A2A] border-0"
                        placeholder="0"
                      />
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center justify-between py-4">
                <Label htmlFor="monthly" className="font-medium">Monthly donation</Label>
                <Switch
                  id="monthly"
                  checked={isMonthly}
                  onCheckedChange={setIsMonthly}
                />
              </div>

              {primaryWallet && <div>
                <h3 className="text-2xl font-bold mb-2">Verify your wallet address</h3>
                <p className="text-gray-400 mb-4">Donations will be sent from your primary wallet.</p>
                <div className="flex items-center gap-2 bg-[#2A2A2A] p-3 rounded">
                  <code className="text-gray-300 flex-1">{primaryWallet?.address}</code>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>}

              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
                  {error}
                </div>
              )}

              {!primaryWallet && <Button 
                className="w-full bg-amber-500 hover:bg-amber-600 text-black py-6 text-lg disabled:opacity-50"
                onClick={connectWallet}
              >
                Connect wallet
              </Button>}

              {primaryWallet && <Button 
                className="w-full bg-amber-500 hover:bg-amber-600 text-black py-6 text-lg disabled:opacity-50"
                onClick={handleDonate}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Confirm & donate'}
              </Button>}

              {/* Thank you modal */}
              {showThankYou && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-[#2A2A2A] p-6 rounded-lg max-w-md mx-4">
                    <div className="flex items-center gap-2 text-green-500 mb-2">
                      <CheckCircle2 className="h-6 w-6" />
                      <h3 className="text-xl font-bold text-white">Thank you!</h3>
                    </div>
                    <p className="text-gray-300">
                      Your donation of ${selectedAmount === 'custom' ? customAmount : selectedAmount}
                      {isMonthly ? ' per month' : ''} has been locked into the funding pool and is now
                      being distributed to shelters in need!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}