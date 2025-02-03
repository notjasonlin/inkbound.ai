"use client";

import { Shrikhand } from 'next/font/google';
import Navbar from '../components/landing_page/navbar';
import Footer from '../components/landing_page/footer';
import FAQ from '@/components/landing_page/faq';
import Features from "@/components/landing_page/features";
import Hero from "@/components/landing_page/hero";
import Pricing from "@/components/landing_page/pricing";
import About from "@/components/landing_page/about";
import { Loading } from '@/components/loading/Loading';
import { useLoading } from '@/hooks/useLoading';
import { useNonce } from '@/context/NonceContext';
import Script from 'next/script';

const shrikhand = Shrikhand({ subsets: ['latin'], weight: '400' });

export default function Home() {
  const nonce = useNonce();
  const isLoading = useLoading(500);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="bg-white text-gray-800">
      <Script
        nonce={nonce}
        id="shrikhand-font"
        strategy="afterInteractive"
      />
      <Navbar />
      <main 
        nonce={nonce}
      >
        <Hero/>
        <Features/>
        <Pricing/>
        <FAQ />
        <About />
        <Footer />
      </main>
    </div>
  );
}
