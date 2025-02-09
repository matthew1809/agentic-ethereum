import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { ZeroDevSmartWalletConnectors } from "@dynamic-labs/ethereum-aa";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { agentManager } from "@/lib/agentManager";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Animal Impact Agents",
  description: "AI-powered animal welfare platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Initialize all agents on app startup
  try {
    await agentManager.initialize();
  } catch (error) {
    console.error('Failed to initialize agents:', error);
    // Continue loading the app even if agent initialization fails
  }

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-primary`}>
        {/* @ts-expect-error - Dynamic Labs SDK */}
        <DynamicContextProvider
          theme="dark"
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