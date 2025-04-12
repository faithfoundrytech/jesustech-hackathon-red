"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Fun biblical loading quips
const loadingQuips = [
  "John from the Bible says, \"I can finish this game faster than you! 🏃🏽‍♂️\" ~ Probably...",
  "Loading divine questions... Moses is parting our server traffic...",
  "David is still looking for five smooth stones to defeat this loading screen...",
  "Noah says two questions of every type are loading...",
  "Peter tried walking on these loading times, but he's sinking a bit...",
  "Jesus turned water into wine, but turning code into games takes a second...",
  "Adam and Eve are debating which question to answer first...",
  "Jonah was swallowed by a whale. Your score might get swallowed too if you're not careful!",
  "The walls of Jericho fell after 7 days. This loading screen should be faster than that!",
  "Daniel survived the lion's den. Can you survive these Bible questions?",
  "Samson's strength was in his hair. Yours might be in your Bible knowledge!",
  "Paul wrote letters faster than our servers can load games...",
  "The Israelites wandered 40 years in the desert. Our loading time is much shorter, promise!",
];

export default function Loading() {
  const [quip, setQuip] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Simulate loading progress
  useEffect(() => {
    // Initial quip
    setQuip(loadingQuips[Math.floor(Math.random() * loadingQuips.length)]);
    
    // Change quip every 4 seconds
    const quipInterval = setInterval(() => {
      setQuip(loadingQuips[Math.floor(Math.random() * loadingQuips.length)]);
    }, 4000);
    
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        // Make progress slower as it approaches 100%
        const increment = 100 - prev > 40 ? 10 : 5;
        const newProgress = prev + increment;
        
        // Cap at 90% to give a feeling of waiting for something
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 500);
    
    // Force a minimum loading time of 3 seconds by setting to 100% after that
    const completeTimeout = setTimeout(() => {
      setLoadingProgress(100);
    }, 3000);
    
    return () => {
      clearInterval(quipInterval);
      clearInterval(progressInterval);
      clearTimeout(completeTimeout);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full flex flex-col items-center">
        {/* Bouncing logo */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="mb-8"
        >
          <Image 
            src="/play-the-word-logo-2.png" 
            alt="Play The Word Logo" 
            width={200} 
            height={200}
            priority
          />
        </motion.div>
        
        {/* Loading quip */}
        <motion.div 
          key={quip}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 h-20"
        >
          <p className="text-lg font-medium text-primary">
            {quip}
          </p>
        </motion.div>
        
        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-3 mb-4">
          <motion.div 
            className="bg-gradient-to-r from-primary to-soft-mint h-3 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${loadingProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        {/* Scripture spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
          className="mt-6"
        >
          <div className="w-10 h-10 text-2xl">✝️</div>
        </motion.div>
      </div>
    </div>
  );
} 