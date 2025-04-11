"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export default function ThemeSwitcher() {
  // Initialize to user preference or system preference, defaulting to 'light'
  const [theme, setTheme] = useState("light");

  // On first mount, get the current theme
  useEffect(() => {
    // Check local storage first
    const savedTheme = localStorage.getItem("theme");
    
    // If theme was saved in localStorage, use that
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } 
    // Otherwise check system preference
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    // Update the HTML class for Tailwind dark mode
    document.documentElement.classList.toggle("dark");
    
    // Save preference to localStorage
    localStorage.setItem("theme", newTheme);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
      onClick={toggleTheme}
      className="p-2 rounded-full bg-baby-blue/30 dark:bg-soft-indigo/30 text-deep-navy dark:text-light-lavender"
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <Moon size={18} className="text-deep-navy" />
      ) : (
        <Sun size={18} className="text-light-lavender" />
      )}
    </motion.button>
  );
}