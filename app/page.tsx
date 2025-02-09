import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Clock, Search, Heart } from 'lucide-react'
import HowItWorks from '@/components/how-it-works'
import DonationImpact from '@/components/donation-impact'
import MeetPerfectPet from '@/components/meet-perfect-pet'
import WhyTrustUs from '@/components/why-trust-us'

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <div className="relative px-4 lg:px-8 pt-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              Shelters speak. AI listens. Pets find homes.
            </h1>
            <p className="text-lg text-gray-300 max-w-xl">
              Our AI-powered system keeps shelters open while reducing future homelessness—investing in neutering programs, prioritizing strays over breeder sales, and ensuring donations go where they matter most.
            </p>
            <div className="flex gap-4 pt-4">
              <Button className="bg-amber-500 hover:bg-amber-600 text-black px-8 py-6 text-lg">
                Donate smart
              </Button>
              <Button variant="outline" className="bg-[#212121] text-amber-500 border-amber-500 border-solid px-8 py-6 text-lg">
                Adopt now
              </Button>
            </div>
          </div>
          <div className="relative w-full h-[1000px] -mt-32">
            <Image 
              src="/dog.png"
              alt="Happy dog with tongue out"
              fill
              className="object-contain object-right"
              priority
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-[#3C3A32] py-20 px-4 lg:px-8 -mt-32 relative z-10">
        <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          <div className="space-y-4">
            <Clock className="h-8 w-8 text-amber-500" />
            <h3 className="text-2xl font-bold text-white">More time, less admin</h3>
            <p className="text-gray-300">
              Less paperwork, more time. Agents automate adoption listings & updates.
            </p>
          </div>
          <div className="space-y-4">
            <Search className="h-8 w-8 text-amber-500" />
            <h3 className="text-2xl font-bold text-white">Effortless, transparent funding</h3>
            <p className="text-gray-300">
              Smart contracts secure donations & ensure fair distribution of resources.
            </p>
          </div>
          <div className="space-y-4">
            <Heart className="h-8 w-8 text-amber-500" />
            <h3 className="text-2xl font-bold text-white">Find the perfect match, faster</h3>
            <p className="text-gray-300">
              AI connects adopters with the right pet, prioritizing strays over breeders.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Donation Impact Section */}
      <DonationImpact />

      {/* Meet Perfect Pet Section */}
      <MeetPerfectPet />

      {/* Why Trust Us Section */}
      <WhyTrustUs />
    </>
  );
}
