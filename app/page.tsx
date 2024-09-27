"use client";

import { useEffect, useState } from "react";
import { Shrikhand } from 'next/font/google'; // Import the Shrikhand font
import Navbar from '../components/landing_page/navbar';  // Import Navbar
import Footer from '../components/landing_page/footer';  // Import Footer
import FAQ from '@/components/landing_page/faq'; // Import the FAQ component
import Features from "@/components/landing_page/features";
import Hero from "@/components/landing_page/hero";
import Pricing from "@/components/landing_page/pricing";
import About from "@/components/landing_page/about";


const shrikhand = Shrikhand({ subsets: ['latin'], weight: '400' });

// CSS for loading spinner
const spinnerStyle: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 1000,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const spinnerAnimation = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid #4288A4; // Adjust the color here
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }
`;

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Short delay to simulate any necessary loading

    return () => clearTimeout(timer);
  }, []);

  // Always show loader while checking the login status
  if (isLoading) {
    return (
      <div style={spinnerStyle}>
        <style>{spinnerAnimation}</style>
        <div className="spinner"></div>
      </div>
    );
  }

  // Render landing page only if the user is not logged in
  return (
    <div className="bg-white text-gray-800">
      <Navbar />
      <main className="w-full px-4 md:px-12 lg:px-20 text-center bg-gradient-to-r from-blue-100 to-babyblue-300">
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
