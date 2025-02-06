'use client'
import Image from 'next/image';
import { Button } from "@/components/ui/button"

export default function DonationImpact() {
  return (
    <div className="bg-black py-24 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl relative">
          <h2 className="text-4xl font-bold text-white mb-4">
            How we make every dollar count
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            AI ensures funding is allocated based on real shelter needs, preventing waste
            and maximizing impact.
          </p>

          <div className="relative w-[600px] h-[300px] mb-8 translate-x-[40%]">
            <Image
              src="/donation-impact.png"
              alt="Donation impact visualization showing different funding tiers"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="flex gap-4">
            <Button className="bg-amber-500 hover:bg-amber-600 text-black px-6 py-2">
              Donate now
            </Button>
            <Button variant="outline" className="text-amber-500 border-amber-500 hover:bg-amber-500/10 px-6 py-2">
              Impact calculator
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 