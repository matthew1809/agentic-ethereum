'use client'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <footer className="bg-[#1e1e1e] text-white">
      <div className="bg-[#504939] w-full">
        <div className="container mx-auto">
          <div className="flex justify-between items-center py-16 px-4 lg:px-8">
            <div className="max-w-xl">
              <h2 className="text-4xl font-bold mb-4">Join the mission</h2>
              <p className="text-lg text-zinc-300">
                Saving animals is about building a future where every pet has a home.
              </p>
            </div>
            <div className="flex gap-4 -mt-8">
              <Link href="/donate">
                <Button 
                  variant="outline" 
                  className="rounded border border-amber-500/20 bg-transparent text-amber-500 hover:bg-amber-500/10 px-6"
                >
                  Donate now
                </Button>
              </Link>
              <Link href="/join">
                <Button 
                  className="rounded bg-amber-500 text-zinc-900 hover:bg-amber-400 px-6"
                >
                  Join the program
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto">
        <div className="border-t border-zinc-800/50">
          <div className="py-8 px-4 lg:px-8">
            <Link href="/" className="inline-block mb-8">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                <span role="img" aria-label="paw emoji" className="text-zinc-900">🐾</span>
              </div>
            </Link>
            <nav className="flex gap-8 mb-4">
              <Link href="/" className="text-zinc-400 hover:text-white transition-colors">Home</Link>
              <Link href="/adopt" className="text-zinc-400 hover:text-white transition-colors">Adopt</Link>
              <Link href="/donate" className="text-zinc-400 hover:text-white transition-colors">Donate</Link>
              <Link href="/about" className="text-zinc-400 hover:text-white transition-colors">About</Link>
              <Link href="/insights" className="text-zinc-400 hover:text-white transition-colors">Insights</Link>
            </nav>
            <p className="text-sm text-zinc-500">© 2025 Animal Impact Agents</p>
          </div>
        </div>
      </div>
    </footer>
  );
} 