import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";
import Navigation from "@/components/navigation";

import {
  DynamicContextProvider,
} from "@dynamic-labs/sdk-react-core";
import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

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
        <DynamicContextProvider
      settings={{
        // Find your environment id at https://app.dynamic.xyz/dashboard/developer
        environmentId: "afa4f40f-a9a3-4bea-ab17-4a7faf287247",
        walletConnectors: [EthereumWalletConnectors, ZeroDevSmartWalletConnectors],
      }}
    >
        <Navigation />
        {/* Page Content */}
        <main className="pt-16">
          {children}
        </main>
        {/* Footer */}
        <Footer />
        </DynamicContextProvider>
      </body>
    </html>
  );
}
