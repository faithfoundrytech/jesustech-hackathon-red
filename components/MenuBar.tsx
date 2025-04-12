"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignOutButton, UserButton, useUser } from "@clerk/nextjs";
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md shadow-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/home">
              <div className="font-fredoka text-primary text-xl">
                Play The Word
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - hidden on mobile */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <NavLink href="/home">Dashboard</NavLink>
            <NavLink href="/churches/manage">Manage Church</NavLink>
            <NavLink href="/leaderboard">Ranking</NavLink>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
            
            <div className="hidden md:flex md:items-center md:space-x-2">
              <div className="text-foreground mr-2">
                {user?.firstName || "User"}
              </div>
              <UserButton />
          
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                aria-label="Toggle menu"
                className="p-2 rounded-full bg-accent/30 text-foreground"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background">
          <div className="px-4 pb-4 space-y-4">
            <MobileNavLink href="/home" onClick={() => setIsMenuOpen(false)}>Dashboard</MobileNavLink>
            <MobileNavLink href="/churches/manage" onClick={() => setIsMenuOpen(false)}>Manage Church</MobileNavLink>
            <MobileNavLink href="/leaderboard" onClick={() => setIsMenuOpen(false)}>Ranking</MobileNavLink>
            
            <UserButton />
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
      className="text-foreground hover:text-primary font-medium transition-colors"
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
      className="block py-3 text-foreground font-medium border-b border-border/10"
    >
      {children}
    </Link>
  );
} 