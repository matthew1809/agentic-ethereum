'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`flex items-center justify-between p-4 lg:px-8 fixed w-full top-0 z-50 transition-all duration-200 ${
      isScrolled ? 'bg-primary shadow-lg' : 'bg-transparent'
    }`}>
      <div className="flex gap-8">
        <Link 
          href="/" 
          className={`transition-colors ${
            pathname === '/' 
              ? 'text-white border-b-2 border-amber-500' 
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Home
        </Link>
        <Link 
          href="/adopt" 
          className={`transition-colors ${
            pathname === '/adopt'
              ? 'text-white border-b-2 border-amber-500'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Adopt
        </Link>
        <Link 
          href="/shelters" 
          className={`transition-colors ${
            pathname === '/shelters'
              ? 'text-white border-b-2 border-amber-500'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Shelters
        </Link>
        <Link 
          href="/donate" 
          className={`transition-colors ${
            pathname === '/donate'
              ? 'text-white border-b-2 border-amber-500'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Donate
        </Link>
        <Link 
          href="/about" 
          className={`transition-colors ${
            pathname === '/about'
              ? 'text-white border-b-2 border-amber-500'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          About
        </Link>
      </div>
      <div className="flex gap-4">
        {/* <Button variant="ghost" className="text-gray-300 hover:text-white">
          Log in
        </Button> */}
        <Link href="/join">
          <Button className="bg-amber-500 hover:bg-amber-600 text-black">
            Join in
          </Button>
        </Link>
      </div>
    </nav>
  );
} 