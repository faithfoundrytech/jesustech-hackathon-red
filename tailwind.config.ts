import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Enable dark mode with class approach
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'soft-purple': '#A88BFE', // Main Accent / Buttons
        'warm-peach': '#FFD6A5', // Highlight / Call to Action
        'deep-navy': '#2F2F5D', // Text on Light BG

        // Secondary Colors
        'cream-white': '#FFF8F1', // Background Light
        'baby-blue': '#B8E4F0', // Card Backgrounds
        'soft-mint': '#C5FAD5', // UI Elements
        'lemon-yellow': '#F9F871', // Info / Tooltip

        // Dark Mode Colors (assuming we might need them)
        'deep-blue-grey': '#1E1F2B', // Background
        'soft-indigo': '#353565', // Cards
        'light-lavender': '#F3F1FF', // Text
        'coral-pink': '#FFADAD', // Highlight/CTA
      },
      fontFamily: {
        poppins: ['var(--font-poppins)'],
        inter: ['var(--font-inter)'],
        fredoka: ['var(--font-fredoka)'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config; 