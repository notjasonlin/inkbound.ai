import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { UserProvider } from "@/components/UserContext";
import { headers } from 'next/headers';
import Script from 'next/script';
import { NonceProvider } from '@/context/NonceContext';

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
        </NonceProvider>
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = headers().get('x-nonce') || '';
  return <RootLayoutInner nonce={nonce}>{children}</RootLayoutInner>;
}
