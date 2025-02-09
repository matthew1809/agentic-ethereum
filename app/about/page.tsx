'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';

interface BlockchainStats {
  balance: string;
  shelterCount: number;
  donationCount: number;
}

const About = () => {
  const [stats, setStats] = useState<BlockchainStats>({ balance: '0', shelterCount: 0, donationCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch blockchain stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#1B1B1B] text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Why we built <span className="text-amber-500">A</span>nimal
              <br /><span className="text-amber-500">I</span>mpact
            </h1>
            <p className="text-lg text-zinc-300 mb-8">
              Every year, millions of animals end up in shelters, many of them struggling to
              find homes. The problem is even bigger in countries like Brazil, where pet
              homelessness reaches 25%.
            </p>
            <p className="text-lg text-zinc-300">
              Animal Impact was born from our work on{' '}
              <Link href="#" className="text-amber-500 hover:text-amber-400">
                The State of Pet Homelessness
              </Link>
              —a project that exposed the global scale of the issue and the lack of efficient
              solutions. Inspired by this research, we wanted to go beyond data and create an
              AI-powered platform that actively helps shelters and adopters find the right
              match while powering funding to reduce pet homelessness long term.
            </p>
          </div>
          <div>
            <Image
              src="/dog-about.png"
              alt="Happy dog smiling"
              width={600}
              height={600}
              className="rounded-lg"
              priority
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 mb-24">
          <h2 className="text-3xl font-bold mb-8">Impact so far</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-800/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Total Balance</h3>
                <span className="text-xs text-gray-500">Base Sepolia</span>
              </div>
              <div className="flex items-baseline">
                {isLoading ? (
                  <LoaderCircle className="w-6 h-6 animate-spin text-amber-500" />
                ) : (
                  <>
                    <span className="text-2xl font-bold text-white">{stats.balance}</span>
                    <span className="ml-1 text-gray-400">ETH</span>
                  </>
                )}
              </div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Registered Shelters</h3>
                <span className="text-xs text-gray-500">Active</span>
              </div>
              <div className="flex items-baseline">
                {isLoading ? (
                  <LoaderCircle className="w-6 h-6 animate-spin text-amber-500" />
                ) : (
                  <>
                    <span className="text-2xl font-bold text-white">{stats.shelterCount}</span>
                    <span className="ml-1 text-gray-400">shelters</span>
                  </>
                )}
              </div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Total Donations</h3>
                <span className="text-xs text-gray-500">All time</span>
              </div>
              <div className="flex items-baseline">
                {isLoading ? (
                  <LoaderCircle className="w-6 h-6 animate-spin text-amber-500" />
                ) : (
                  <>
                    <span className="text-2xl font-bold text-white">{stats.donationCount}</span>
                    <span className="ml-1 text-gray-400">transactions</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold mb-12">Who we are</h2>
          <div className="space-y-8">
            {/* Matthew */}
            <div className="flex items-center gap-8 bg-zinc-800/50 rounded-xl p-6">
              <Image
                src="/matthew.png"
                alt="Matthew Foyle"
                width={120}
                height={120}
                className="rounded-full"
              />
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Matthew Foyle – Developer & Technical Lead
                </h3>
                <p className="text-zinc-300">
                  Web3 & AI Engineer, passionate about automation and smart systems. Matthew came
                  up with the idea for Animal Impact and leads the technical development.
                </p>
              </div>
            </div>

            {/* Nathalia */}
            <div className="flex items-center gap-8 bg-zinc-800/50 rounded-xl p-6">
              <Image
                src="/nathalia.png"
                alt="Nathalia Andrade"
                width={120}
                height={120}
                className="rounded-full"
              />
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Nathalia Andrade – Product Designer & UX Lead
                </h3>
                <p className="text-zinc-300">
                  Brazilian UX/Product Designer passionate about Web3, AI, and impact-driven
                  projects. Seeing how severe pet homelessness is in Brazil made this project personal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;