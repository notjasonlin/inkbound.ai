'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaBars, FaTimes } from 'react-icons/fa'; // Icons for the hamburger menu
import { Shrikhand } from 'next/font/google'; // Import the Shrikhand font
import LoginButton from '../LoginLogoutButton';

const shrikhand = Shrikhand({ subsets: ['latin'], weight: '400' });

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false); // State to handle menu open/close for mobile

  // Custom smooth scrolling function
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 1000; // 1000ms = 1 second (adjust this for slower scrolling)
      let start: number | null = null;

      const smoothScroll = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const easeInOutQuad = (t: number) =>
          t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easing function
        const percent = easeInOutQuad(Math.min(progress / duration, 1));
        window.scrollTo(0, startPosition + distance * percent);
        if (progress < duration) {
          window.requestAnimationFrame(smoothScroll);
        }
      };

      window.requestAnimationFrame(smoothScroll);
    } else {
      // If the element is not found, navigate to the section through router
      router.push(`/#${id}`);
    }
  };

  // Toggle the mobile menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="w-full bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-20"> {/* Adjusted height */}
          <div className="flex-shrink-0 flex items-center">
            {/* Apply gradient to the text */}
            <h1
              className={`text-4xl px-2 font-bold bg-gradient-to-r from-babyblue-500 to-blue-500 bg-clip-text text-transparent ${shrikhand.className}`}
              style={{ lineHeight: '1.2', paddingBottom: '0.25rem' }} // Adjusted line height and padding
            >
              Inkbound
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {/* <div className="hidden md:flex items-center space-x-4"> */}
              {/* Sign in and Get Started buttons */}
              {/* <LoginButton label="Sign in" />
              <LoginButton label="Get Started" /> */}
            {/* </div> */}
            <button
              className="text-black hover:text-babyblue-600"
              onClick={() => scrollToSection('features')}
            >
              Features
            </button>
            <button
              className="text-black hover:text-babyblue-600"
              onClick={() => scrollToSection('pricing')}
            >
              Pricing
            </button>
            <button
              className="text-black hover:text-babyblue-600"
              onClick={() => scrollToSection('faq')}
            >
              FAQ
            </button>
            <button
              className="text-black hover:text-babyblue-600"
              onClick={() => scrollToSection('about-us')}
            >
              About Us
            </button>
          </div>

          {/* Hamburger Icon for Mobile */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu}>
              {menuOpen ? (
                <FaTimes className="text-2xl text-black" /> // X icon when menu is open
              ) : (
                <FaBars className="text-2xl text-black" /> // Hamburger icon when menu is closed
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-4">
            <div className="flex flex-col space-y-4">
              <button
                className="text-black hover:text-babyblue-600"
                onClick={() => {
                  scrollToSection('features');
                  setMenuOpen(false); // Close menu after navigation
                }}
              >
                Features
              </button>
              <button
                className="text-black hover:text-babyblue-600"
                onClick={() => {
                  scrollToSection('pricing');
                  setMenuOpen(false); // Close menu after navigation
                }}
              >
                Pricing
              </button>
              <button
                className="text-black hover:text-babyblue-600"
                onClick={() => {
                  scrollToSection('faq');
                  setMenuOpen(false); // Close menu after navigation
                }}
              >
                FAQ
              </button>
              <button
                className="text-black hover:text-babyblue-600 mb-4" // Add spacing at the bottom
                onClick={() => {
                  scrollToSection('about-us');
                  setMenuOpen(false); // Close menu after navigation
                }}
              >
                About Us
              </button>
              
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
