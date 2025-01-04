'use client';

import React from 'react';
import Link from 'next/link';
import { FaUniversity, FaStar, FaHeart } from 'react-icons/fa';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 py-2 sticky top-0 z-20">
      <div className="container mx-auto flex justify-center space-x-8 text-sm sm:text-base">
        <NavItem href="/dashboard/schools" icon={<FaUniversity />} label="Find Schools" />
        <NavItem href="/dashboard/schools/recommended-schools" icon={<FaStar />} label="Recommended" />
        <NavItem href="/dashboard/schools/favorite-schools" icon={<FaHeart />} label="Favorites" />
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
  <Link
    href={href}
    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition font-medium"
  >
    <span className="text-xl">{icon}</span>
    <span>{label}</span>
  </Link>
);

export default Navbar;
