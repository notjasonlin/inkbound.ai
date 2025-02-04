"use client";

import { useEffect, useState } from "react";

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="w-full bg-babyblue-900 py-8 text-black">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Section */}
          <div>
            <h3 className="text-xl md:text-2xl font-semibold">
              Inkbound.ai
            </h3>
            <p className="mt-2 text-sm md:text-base">
              Changing the college athlete recruitment game.
            </p>
          </div>

          {/* Middle Section - Contact Info */}
          <div className="md:text-center">
            <h4 className="text-lg md:text-xl font-semibold">Contact</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="mailto:founders@inkbound.ai" className="text-black hover:text-blue-600 text-sm md:text-base">
                  founders@inkbound.ai
                </a>
              </li>
              <li>
                <a href="tel:+19546393002" className="text-black hover:text-blue-600 text-sm md:text-base">
                  +1 (954) 639-3002
                </a>
              </li>
              <li>
                <p className="text-black text-sm md:text-base">Pembroke Pines, FL, USA</p>
              </li>
            </ul>
          </div>

          {/* Right Section - Privacy & Terms */}
          <div className="flex flex-col md:flex-row md:justify-end md:space-x-6 space-y-2 md:space-y-0 text-center md:text-left">
            <a href="/policy/privacy" className="text-black hover:text-blue-600 text-sm md:text-base">
              Privacy Policy
            </a>
            <a href="/policy/terms-and-conditions" className="text-black hover:text-blue-600 text-sm md:text-base">
              Terms and Conditions
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 text-center text-black">
          <p className="text-xs md:text-sm">
            &copy; {year ? year : ""} Inkbound.ai. All rights reserved to Inkbound.ai, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
