"use client";

import { useEffect, useState } from "react";
import Navbar from '../components/navbar';  // Import Navbar
import Footer from '../components/footer';  // Import Footer
import LoginButton from '@/components/LoginLogoutButton';  // Import LoginButton

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
  // Remove the router constant

  useEffect(() => {
    // Simplified effect to just set loading to false after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Short delay to simulate any necessary loading

    return () => clearTimeout(timer);
  }, []); // Empty dependency array as we're not using any external values

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
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="w-full px-4 md:px-12 lg:px-20 text-center">

        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center py-16 bg-white space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold">
            Welcome to <span className="text-babyblue-600">Inkbound.ai</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-600 mt-4 max-w-2xl">
            Affordable college athletic recruitment software designed for athletes who want a simple and effective way to get noticed.
          </p>

          {/* Screen recording container */}
          {/* <div className="w-full max-w-4xl mt-10">
            <video
              className="rounded-lg shadow-xl w-full"
              src="/path-to-your-screen-recording.mp4"
              autoPlay
              loop
              muted
              controls
            />
          </div> */}

          {/* Use LoginButton instead of manual login handling */}
          <div className="mt-6">
            <LoginButton /> {/* Replaces the "Log In with Google" button */}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50 w-full">
          <h2 className="text-4xl font-bold mb-12 text-babyblue-600">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white shadow-lg p-8 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4">Mass Emailing</h3>
              <p className="text-gray-600">
                Send personalized emails to 500+ coaches at once using custom templates designed to maximize responses.
              </p>
            </div>
            <div className="bg-white shadow-lg p-8 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4">School Suggestions</h3>
              <p className="text-gray-600">
                Receive a curated list of schools that match your athletic and academic background, streamlining your search.
              </p>
            </div>
            <div className="bg-white shadow-lg p-8 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4">Highlight Marketplace</h3>
              <p className="text-gray-600">
                Easily create and share your highlight videos with college coaches using our built-in highlight marketplace.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-white w-full">
          <h2 className="text-4xl font-bold mb-12 text-babyblue-600">Pricing</h2>
          <div className="flex flex-col md:flex-row justify-center space-y-8 md:space-y-0 md:space-x-8">
            {/* Pricing plans */}
            <div className="bg-babyblue-50 p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold">Basic</h3>
              <p className="text-lg text-gray-600 mt-4">Free for a limited number of emails.</p>
            </div>
            <div className="bg-babyblue-100 p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold">Plus</h3>
              <p className="text-lg text-gray-600 mt-4">$9/month for extended features.</p>
            </div>
            <div className="bg-babyblue-200 p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold">Pro</h3>
              <p className="text-lg text-gray-600 mt-4">$29/month for unlimited access.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-gray-50 w-full">
          <h2 className="text-4xl font-bold mb-12 text-babyblue-600">Frequently Asked Questions</h2>
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h3 className="text-2xl font-semibold mb-2">Is this ethical?</h3>
              <p className="text-gray-600">
                Yes, our software follows the guidelines set by university and athletic recruitment policies.
              </p>
            </div>
            <div className="text-left">
              <h3 className="text-2xl font-semibold mb-2">
                Can colleges tell if you used Inkbound?
              </h3>
              <p className="text-gray-600">
                No, your emails will be sent from your own personal email, ensuring a personalized and authentic experience.
              </p>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about-us" className="py-20 bg-white w-full">
          <h2 className="text-4xl font-bold mb-12 text-babyblue-600">About Us</h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            At Inkbound.ai, we are passionate about making the college recruiting process more accessible and affordable. Our mission is to help talented athletes connect with the right opportunities without the high costs. We believe that every athlete deserves a chance to succeed, and we are here to support them through every step of the recruitment process.
          </p>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}