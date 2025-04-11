"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";
import { useAuth } from "@clerk/nextjs";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream-white/90 dark:bg-deep-blue-grey/90 backdrop-blur-md shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/play-the-word-logo-2.png"
              alt="Play The Word"
              width={140}
              height={40}
              className="h-8 w-auto"
            />
          </div>

          {/* Desktop Navigation - hidden on mobile */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#how-it-works">How It Works</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="#contact">Contact</NavLink>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
            
            <div className="hidden md:block">
              {isLoaded && isSignedIn ? (
                <Link href="/home">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-soft-purple text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
                  >
                    Dashboard
                  </motion.button>
                </Link>
              ) : (
                <Link href="/sign-in">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-soft-purple text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
                  >
                    Sign In
                  </motion.button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleMenu}
                aria-label="Toggle menu"
                className="p-2 rounded-full bg-baby-blue/30 dark:bg-soft-indigo/30 text-deep-navy dark:text-light-lavender"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-cream-white dark:bg-deep-blue-grey"
          >
            <div className="px-4 pb-4 space-y-4">
              <MobileNavLink href="#features" onClick={() => setIsMenuOpen(false)}>Features</MobileNavLink>
              <MobileNavLink href="#how-it-works" onClick={() => setIsMenuOpen(false)}>How It Works</MobileNavLink>
              <MobileNavLink href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</MobileNavLink>
              <MobileNavLink href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</MobileNavLink>
              
              {isLoaded && isSignedIn ? (
                <Link href="/home" onClick={() => setIsMenuOpen(false)}>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-soft-purple text-white py-3 rounded-xl text-sm font-semibold shadow-md"
                  >
                    Dashboard
                  </motion.button>
                </Link>
              ) : (
                <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-soft-purple text-white py-3 rounded-xl text-sm font-semibold shadow-md"
                  >
                    Sign In
                  </motion.button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <motion.a
      href={href}
      className="text-deep-navy dark:text-light-lavender hover:text-soft-purple dark:hover:text-coral-pink font-medium transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.a>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.a
      href={href}
      onClick={onClick}
      className="block py-3 text-deep-navy dark:text-light-lavender font-medium border-b border-deep-navy/10 dark:border-light-lavender/10"
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.a>
  );
} 