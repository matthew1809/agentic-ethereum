'use client';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CopyIcon, CheckCircle2 } from "lucide-react";
// import { addDonor } from "@/lib/data/addDonor";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { parseEther } from 'viem';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import getContractBalance from '@/lib/utils/getContractBalance';
import type { Hash } from 'viem';  

export default function DonatePage() {
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();

  const [showThankYou, setShowThankYou] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState('0.004');
  const [isMonthly, setIsMonthly] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const donateFormRef = useRef<HTMLDivElement>(null);
  const [tx, setTx] = useState<Hash | null>(null);

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
    { value: '0.004', label: '0.004 ETH' },
    { value: '0.019', label: '0.019 ETH' },
    { value: '0.038', label: '0.038 ETH' },
    { value: '0.191', label: '0.191 ETH' },
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

      const name = "Anonymous Donor"; // Placeholder

      const response = await fetch('/api/donors', {
        method: 'POST',
        body: JSON.stringify({
          name,
          amount,
          recurring: isMonthly,
          duration_months: isMonthly ? 12 : 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create donor');
      }

      if(!primaryWallet) {
        throw new Error('No primary wallet found');
      }

      if(!isEthereumWallet(primaryWallet)) {
        throw new Error('Primary wallet is not an Ethereum wallet');
      }

      const walletClient = await primaryWallet?.getWalletClient();

      if (!walletClient) {
        throw new Error('No wallet client found');
      }

      console.log('Sending transaction of', amount, 'ETH');

      const tx = await walletClient.sendTransaction({
        to: '0x933bF9dbBe7ccff543Abb2C5878Fb879618182C8',
        value: parseEther(amount.toString()),
      });

      setTx(tx);
      
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

  useEffect(() => {
    const fetchContractBalance = async () => {
      if(primaryWallet && isEthereumWallet(primaryWallet)) {
        console.log('Fetching contract balance');
        const publicClient = await primaryWallet.getPublicClient();
        getContractBalance(publicClient);
      }
    }
    fetchContractBalance();
  }, [primaryWallet]);

  return (
    <div className="min-h-screen bg-[#1B1B1B] text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Give smarter, save more lives.
            </h1>
            <p className="text-xl text-zinc-300 mb-8">
              Every dollar goes directly into our smart funding system, ensuring a balance between helping animals without a home, and helping less be born without one.
            </p>
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Where donations are allocated</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">🐾</span>
                  <span>Neutering programs</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">📢</span>
                  <span>Adoption promotion</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">🏥</span>
                  <span>Medical care</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">🧠</span>
                  <span>Behavioral & rehabilitation programs</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">🥩</span>
                  <span>Food & nutrition</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">🚗</span>
                  <span>Transport & relocation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">🏠</span>
                  <span>Shelter upkeep</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">👥</span>
                  <span>Staff & volunteer training</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <Image
              src="/cat-donate.png"
              alt="Cat looking at camera"
              width={800}
              height={800}
              className="rounded-lg object-cover"
              priority
            />
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-8 pb-24">
        <div className="w-full">
          {/* Top section with image and donation flow */}
          <div className="grid lg:grid-cols-2 gap-12 mb-12">
            {/* Left side - Image */}
            <div>
              <Image
                src="/dog-donate.png"
                alt="Border Collie looking at camera"
                width={600}
                height={800}
                className="object-contain"
                priority
              />
            </div>

            {/* Right side - Donation Flow */}
            <div className='pt-12'>
              <h2 className="text-3xl font-bold mb-12">How your donation flows</h2>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-green-700" />
                <div className="space-y-16">
                  {donationFlow.map((step) => (
                    <div key={step.step} className="relative pl-12">
                      <div className="absolute left-0 -translate-x-1/2 w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-sm">
                        {step.step}
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{step.icon}</span>
                          <h3 className="text-2xl font-semibold">{step.title}</h3>
                        </div>
                        <div className="space-y-3 text-gray-300">
                          {step.details.map((detail, i) => (
                            <div key={`${step.step}-${i}`} className="flex items-start gap-3">
                              <span className="text-amber-500 mt-1">→</span>
                              <p className="text-lg">{detail.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom section - Donation Form */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left side - Choose your impact */}
            <div ref={donateFormRef} className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6">Choose your impact</h2>
                <div className="bg-[#1E1E1E] rounded-lg p-8 space-y-8">
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
                        <span>ETH</span>
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="flex items-center justify-between py-4">
                    <Label htmlFor="monthly" className="font-medium">Monthly donation</Label>
                    <Switch
                      id="monthly"
                      checked={isMonthly}
                      onCheckedChange={setIsMonthly}
                    />
                  </div>

                  {primaryWallet && <div>
                    <h3 className="text-xl font-semibold mb-2">Verify your wallet address</h3>
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
                </div>
              </div>
            </div>

            {/* Right side - Real-time allocation summary */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold mb-6">Real-time allocation</h2>
              <div className="bg-[#2A2A2A] rounded-lg p-8">
                <h3 className="text-xl font-semibold mb-4">Real-time allocation summary</h3>
                <p className="text-gray-400 mb-4">{selectedAmount === 'custom' ? customAmount : selectedAmount} ETH today helps:</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>🥩 30% → Food & nutrition</span>
                    <span className="text-gray-400">{(Number(selectedAmount === 'custom' ? customAmount : selectedAmount) * 0.3).toFixed(4)} ETH</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🏠 50% → Winter shelter supplies</span>
                    <span className="text-gray-400">{(Number(selectedAmount === 'custom' ? customAmount : selectedAmount) * 0.5).toFixed(4)} ETH</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🏥 20% → Emergency medical care</span>
                    <span className="text-gray-400">{(Number(selectedAmount === 'custom' ? customAmount : selectedAmount) * 0.2).toFixed(4)} ETH</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-4 italic">Impact changes dynamically based on shelters&apos; most urgent needs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thank you modal */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2A2A2A] p-6 rounded-lg max-w-md mx-4">
            <div className="flex items-center gap-2 text-green-500 mb-2">
              <CheckCircle2 className="h-6 w-6" />
              <h3 className="text-xl font-bold text-white">Thank you!</h3>
            </div>
            <p className="text-gray-300">
              Your donation of {selectedAmount === 'custom' ? customAmount : selectedAmount} ETH
              {isMonthly ? ' per month' : ''} has been locked into the funding pool and is now
              being distributed to shelters in need!
            </p>
            {tx && (
              <p className="text-gray-300 mt-2">
                Transaction hash: <a href={`https://etherscan.io/tx/${tx}`} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400">
                  {tx}
                </a>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}