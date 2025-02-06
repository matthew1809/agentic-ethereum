'use client'
import { Button } from "@/components/ui/button"
import Image from 'next/image'

export default function MeetPerfectPet() {
  return (
    <div className="bg-[#1B4B2D] py-16 px-4 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="lg:max-w-md relative z-10">
            <h2 className="text-4xl font-bold text-white mb-4">
              Meet your perfect pet
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              Tell our AI agent about your home & lifestyle, and get matched with pets that
              fit you best.
            </p>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black px-6 py-2">
              Find a pet
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute right-0 top-0 h-[250%] w-1/2 -translate-y-[60%]">
        <Image
          src="/cat-tall.png"
          alt="Cat looking up"
          fill
          className="object-contain object-right"
          priority
        />
      </div>
    </div>
  );
} 