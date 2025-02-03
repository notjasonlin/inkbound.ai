import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { UserProvider } from "@/components/UserContext";
import { headers } from 'next/headers';
import Script from 'next/script';
import { NonceProvider } from '@/context/NonceContext';
import { Toast } from 'flowbite-react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inkbound",
  description: "Elevate Your Game: Your Journey to College Athletics Starts Here",
};

function RootLayoutInner({
  children,
  nonce,
}: {
  children: React.ReactNode;
  nonce: string;
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className)}>
        <NonceProvider nonce={nonce}>
          <UserProvider>
            {children}
          </UserProvider>
          <div id="toast-container" className="fixed bottom-5 right-5 z-50">
            {/* Toasts will be rendered here dynamically */}
          </div>
        </NonceProvider>
      </body>
    </html>
  );
}

async function getNonce() {
  const hdrs = await headers();
  return hdrs.get('x-nonce') || "";
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = await getNonce();
  return <RootLayoutInner nonce={nonce}>{children}</RootLayoutInner>;
}
