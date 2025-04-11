"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";

export default function MenuBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-white/90 dark:bg-deep-blue-grey/90 backdrop-blur-md shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/home">
              <img
                src="/play-the-word-logo-2.png"
                alt="Play The Word"
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation - hidden on mobile */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <NavLink href="/home">Dashboard</NavLink>
            <NavLink href="/churches/manage">Manage Church</NavLink>
            <NavLink href="/rewards">Rewards</NavLink>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
            
            <div className="hidden md:flex md:items-center md:space-x-2">
              <div className="text-deep-navy dark:text-light-lavender mr-2">
                {user?.firstName || "User"}
              </div>
              <SignOutButton>
                <button className="bg-soft-purple text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-shadow">
                  Sign Out
                </button>
              </SignOutButton>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                aria-label="Toggle menu"
                className="p-2 rounded-full bg-baby-blue/30 dark:bg-soft-indigo/30 text-deep-navy dark:text-light-lavender"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-cream-white dark:bg-deep-blue-grey">
          <div className="px-4 pb-4 space-y-4">
            <MobileNavLink href="/home" onClick={() => setIsMenuOpen(false)}>Dashboard</MobileNavLink>
            <MobileNavLink href="/churches/manage" onClick={() => setIsMenuOpen(false)}>Manage Church</MobileNavLink>
            <MobileNavLink href="/rewards" onClick={() => setIsMenuOpen(false)}>Rewards</MobileNavLink>
            
            <div className="pt-2 border-t border-deep-navy/10 dark:border-light-lavender/10">
              <SignOutButton>
                <button className="w-full bg-soft-purple text-white py-3 rounded-xl text-sm font-semibold shadow-md">
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href}
      className="text-deep-navy dark:text-light-lavender hover:text-soft-purple dark:hover:text-coral-pink font-medium transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block py-3 text-deep-navy dark:text-light-lavender font-medium border-b border-deep-navy/10 dark:border-light-lavender/10"
    >
      {children}
    </Link>
  );
} 