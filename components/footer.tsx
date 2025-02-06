'use client'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <div className="bg-primary py-24 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Join the mission
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Saving animals is about building a future where every pet has a home.
            </p>
            <div className="flex gap-4">
              <Button className="bg-amber-500 hover:bg-amber-600 text-black px-6 py-2">
                Donate now
              </Button>
              <Button variant="outline" className="text-amber-500 border-amber-500 hover:bg-amber-500/10 px-6 py-2">
                Join the program
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-24 flex flex-col md:flex-row justify-between items-center gap-8">
          <nav className="flex gap-8">
            <Link href="/" className="text-gray-300 hover:text-white">Home</Link>
            <Link href="/adopt" className="text-gray-300 hover:text-white">Adopt</Link>
            <Link href="/donate" className="text-gray-300 hover:text-white">Donate</Link>
            <Link href="/about" className="text-gray-300 hover:text-white">About</Link>
            <Link href="/insights" className="text-gray-300 hover:text-white">Insights</Link>
          </nav>
          <div className="text-gray-400">
            © 2024
          </div>
        </div>
      </div>
    </div>
  );
} 