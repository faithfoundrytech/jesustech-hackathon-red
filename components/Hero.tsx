"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown, Play, Info } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[100vh] flex flex-col items-center justify-center text-center py-12 px-4 overflow-hidden pt-24">
      {/* Background decoration - improved with better positioning and gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        {/* Gradient background - enhanced purple in dark mode */}
        <div className="absolute inset-0 bg-gradient-to-br from-white to-baby-blue/10 dark:from-deep-navy/90 dark:via-purple-900/80 dark:to-deep-navy opacity-80"></div>
        
        {/* Animated bubbles - enhanced purple tones */}
        <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-soft-purple/20 dark:bg-purple-400/20 blur-sm animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-warm-peach/20 dark:bg-purple-500/25 blur-sm animate-float" style={{ animationDelay: '1.2s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-16 h-16 rounded-full bg-baby-blue/20 dark:bg-purple-300/20 blur-sm animate-float" style={{ animationDelay: '0.8s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full bg-soft-purple/15 dark:bg-purple-600/25 blur-sm animate-float" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Abstract background shape - adjusted color */}
        <div className="absolute -top-10 -left-10 opacity-10 dark:opacity-5">
          <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-72 h-72 md:w-96 md:h-96">
            <path fill="#8A3FFC" d="M40.8,-68.7C51.4,-60.5,57.9,-46.6,65.1,-32.9C72.3,-19.1,80.3,-5.5,81.2,8.7C82.1,22.9,75.8,37.8,65.6,49.9C55.3,62,41.1,71.3,25.8,76.5C10.6,81.7,-5.6,82.8,-20.4,78.5C-35.2,74.2,-48.6,64.4,-59.3,52.1C-70,39.7,-78,24.8,-80.1,8.7C-82.1,-7.4,-78.3,-24.6,-68.5,-36.9C-58.7,-49.1,-43,-56.5,-28.9,-63C-14.7,-69.5,-2.1,-75.1,11.1,-72.9C24.2,-70.7,30.1,-76.9,40.8,-68.7Z" transform="translate(100 100)" />
          </svg>
        </div>
      </div>
      
      {/* Main content with text on left and image on right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col-reverse lg:flex-row items-center justify-center gap-8 mb-6 w-full max-w-6xl mx-auto"
      >
        {/* Text content - now on the left */}
        <div className="text-left w-full lg:w-2/5">
        <motion.h1 
            className="sr-only"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Play the Word
        </motion.h1>

          
          <motion.div
            className="flex flex-col gap-3"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-xl md:text-2xl text-deep-navy/90 dark:text-purple-200 font-medium -mt-35">
              Transforming sermons into interactive games
            </p>
            
            <p className="text-base md:text-lg text-deep-navy/80 dark:text-purple-100/90 mb-2">
              A gamified learning platform that brings church sermons to life through engaging quizzes, challenges, and interactive experiences.
            </p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-4 mt-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(147, 51, 234, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-soft-purple to-soft-purple/80 dark:from-purple-600 dark:to-purple-700 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 transition-all"
              >
                <Play size={18} /> Get Started
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(147, 51, 234, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent border-2 border-soft-purple text-soft-purple dark:text-purple-300 dark:border-purple-400 px-6 py-3 rounded-full font-bold hover:bg-soft-purple/5 dark:hover:bg-purple-500/15 transition-all flex items-center gap-2"
              >
                <Info size={18} /> How It Works
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Image - now on the right */}
        <div className="relative w-full lg:w-3/7">
          <motion.div
            whileHover={{ scale: 1.02 }}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Image 
              src="/play-the-word-logo-2.png" 
              alt="Play The Word" 
              width={200} 
              height={80} 
              priority
              className="rounded-xl shadow-xl object-cover w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent rounded-xl dark:from-purple-800/50"></div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Scroll indicator with improved animation and purple accent in dark mode */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="flex flex-col items-center">
          <p className="text-sm text-deep-navy/70 dark:text-purple-200/80 mb-2">Scroll to explore</p>
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="bg-soft-purple/20 dark:bg-purple-500/30 p-2 rounded-full"
          >
            <ArrowDown className="text-soft-purple dark:text-purple-200 w-5 h-5" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}