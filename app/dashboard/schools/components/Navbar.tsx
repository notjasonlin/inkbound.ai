'use client';

import React from 'react';
import Link from 'next/link';
import { FaUniversity, FaStar, FaHeart } from 'react-icons/fa';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-600 text-white py-3 shadow-lg rounded-lg mx-4 mt-4">
      <div className="container mx-auto flex justify-center space-x-10 md:space-x-16 lg:space-x-24">
        <NavItem href="/dashboard/schools" icon={<FaUniversity />} label="Find Schools" />
        <NavItem href="/dashboard/schools/recommended-schools" icon={<FaStar />} label="Recommended Schools" />
        <NavItem href="/dashboard/schools/favorite-schools" icon={<FaHeart />} label="Your Schools" />
      </div>
    </nav>
  );
};

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label }) => (
  <Link href={href} className="flex flex-col items-center hover:text-blue-200 transition-all duration-200">
    <div className="flex items-center space-x-2">
      <span className="text-xl">{icon}</span>
      <span className="hidden md:inline text-lg font-medium">{label}</span>
    </div>
  </Link>
);

export default Navbar;
