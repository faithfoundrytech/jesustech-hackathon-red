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
        'soft-purple': '#7B68EE', // bright soft purple
        'warm-peach': '#FFB5A7', // soft peachy pink
        'deep-navy': '#3B3663', // deep purple
        
        // Secondary Colors
        'cream-white': '#FAF7FF', // light lavender background
        'baby-blue': '#AEDFF7', // soft sky blue
        'soft-mint': '#B7EFC5', // light minty green
        'lemon-yellow': '#FFEF9F', // soft lemon yellow
        'light-coral': '#FFC2D1', // soft pink

        // Dark Mode Colors
        'deep-blue-grey': '#232242', // deep blue-purple background
        'soft-indigo': '#2E2A5A', // slightly lighter purple
        'light-lavender': '#E8E5FF', // light purple text
        'coral-pink': '#FF9E9E', // brighter coral for dark mode
        
        // Shadcn-ui required colors
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      fontFamily: {
        poppins: ['var(--font-poppins)'],
        inter: ['var(--font-inter)'],
        fredoka: ['var(--font-fredoka)'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        'pulse-custom': 'pulse-custom 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-playful": "linear-gradient(135deg, #7B68EE 0%, #A794FF 100%)",
        "gradient-peach": "linear-gradient(135deg, #FFB5A7 0%, #FFC2D1 100%)",
        "gradient-mint": "linear-gradient(135deg, #AEDFF7 0%, #B7EFC5 100%)",
      },
      boxShadow: {
        'playful': '0 10px 25px -5px rgba(123, 104, 238, 0.15), 0 5px 10px -5px rgba(123, 104, 238, 0.1)',
        'playful-hover': '0 15px 30px -5px rgba(123, 104, 238, 0.2), 0 10px 15px -5px rgba(123, 104, 238, 0.15)',
      },
    },
  },
  plugins: [],
};
export default config; 