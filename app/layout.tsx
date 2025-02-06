import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Footer from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Animal Shelter Network",
  description: "Decentralized animal shelter management powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-primary`}>
        {/* Navigation */}
        <nav className="flex items-center justify-between p-4 lg:px-8">
          <div className="flex gap-8">
            <Link href="/" className="text-white border-b-2 border-amber-500">Home</Link>
            <Link href="/adopt" className="text-gray-300 hover:text-white">Adopt</Link>
            <Link href="/donate" className="text-gray-300 hover:text-white">Donate</Link>
            <Link href="/about" className="text-gray-300 hover:text-white">About</Link>
            <Link href="/insights" className="text-gray-300 hover:text-white">Insights</Link>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" className="text-gray-300 hover:text-white">
              Log in
            </Button>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black">
              Sign up
            </Button>
          </div>
        </nav>

        {/* Page Content */}
        <main>
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
