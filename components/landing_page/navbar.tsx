"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaBars, FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import LoginButton from '../LoginLogoutButton';
import ResourcesDropdown from './resources-dropdown'; // ensure this path is correct

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 1000; // 1 second
      let start: number | null = null;

      const smoothScroll = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const easeInOutQuad = (t: number) =>
          t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const percent = easeInOutQuad(Math.min(progress / duration, 1));
        window.scrollTo(0, startPosition + distance * percent);
        if (progress < duration) {
          window.requestAnimationFrame(smoothScroll);
        }
      };

      window.requestAnimationFrame(smoothScroll);
    } else {
      // If the element is not found, navigate via router
      router.push(`/#${id}`);
    }
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="w-full bg-white shadow-lg z-50 relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Image
              src="/inkbound.png"
              alt="Inkbound.ai Logo"
              width={200}
              height={50}
              priority
              className="object-contain py-2"
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <LoginButton label="Sign in" />
              <LoginButton label="Get Started" />
            </div>

            {/* Scroll-based nav */}
            <button
              className="text-black hover:text-blue-600"
              onClick={() => scrollToSection('features')}
            >
              Features
            </button>
            <button
              className="text-black hover:text-blue-600"
              onClick={() => scrollToSection('pricing')}
            >
              Pricing
            </button>
            <button
              className="text-black hover:text-blue-600"
              onClick={() => scrollToSection('faq')}
            >
              FAQ
            </button>
            <ResourcesDropdown />
            <button
              className="text-black hover:text-blue-600"
              onClick={() => scrollToSection('about-us')}
            >
              About Us
            </button>
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu}>
              {menuOpen ? (
                <FaTimes className="text-2xl text-black" />
              ) : (
                <FaBars className="text-2xl text-black" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-4">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-2">
                <LoginButton label="Sign in" />
                <LoginButton label="Get Started" />
              </div>
              <button
                className="text-black hover:text-blue-600"
                onClick={() => {
                  scrollToSection('features');
                  setMenuOpen(false);
                }}
              >
                Features
              </button>
              <button
                className="text-black hover:text-blue-600"
                onClick={() => {
                  scrollToSection('pricing');
                  setMenuOpen(false);
                }}
              >
                Pricing
              </button>
              <button
                className="text-black hover:text-blue-600"
                onClick={() => {
                  scrollToSection('faq');
                  setMenuOpen(false);
                }}
              >
                FAQ
              </button>
              <ResourcesDropdown />
              <button
                className="text-black hover:text-blue-600 mb-4"
                onClick={() => {
                  scrollToSection('about-us');
                  setMenuOpen(false);
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
