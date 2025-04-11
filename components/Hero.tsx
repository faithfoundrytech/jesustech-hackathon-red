"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center text-center py-12 px-4">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-soft-purple/20 animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-warm-peach/20 animate-float" style={{ animationDelay: '1.2s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-16 h-16 rounded-full bg-baby-blue/20 animate-float" style={{ animationDelay: '0.8s' }}></div>
        
        {/* Abstract background shapes */}
        <div className="absolute -bottom-10 -right-10 opacity-20 dark:opacity-10">
          <Image 
            src="https://placehold.co/600x600/A88BFE/FFFFFF?text=Shape" 
            alt="Background shape" 
            width={300} 
            height={300} 
            className="w-72 h-72 md:w-96 md:h-96 object-cover" 
          />
        </div>
        <div className="absolute -top-10 -left-10 opacity-20 dark:opacity-10">
          <Image 
            src="https://placehold.co/600x600/FFD6A5/FFFFFF?text=Shape" 
            alt="Background shape" 
            width={300} 
            height={300} 
            className="w-72 h-72 md:w-96 md:h-96 object-cover" 
          />
        </div>
      </div>
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-8 animate-float"
      >
        <Image 
          src="/play-the-word-icon.png" 
          alt="Play The Word" 
          width={180} 
          height={180} 
          priority
          className="mx-auto"
        />
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Image 
          src="/play-the-word-logo-2.png" 
          alt="Play The Word" 
          width={280} 
          height={80} 
          priority
          className="mx-auto mb-6"
        />
      </motion.div>
      
      <motion.p 
        className="text-lg md:text-xl max-w-lg mx-auto mb-8 text-deep-navy/90 dark:text-light-lavender/90"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        A gamified learning platform that transforms church sermons into interactive quizzes and games.
      </motion.p>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="flex flex-wrap gap-4 justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-soft-purple text-white px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-shadow"
        >
          Get Started
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-transparent border-2 border-soft-purple text-soft-purple px-6 py-3 rounded-full font-semibold hover:bg-soft-purple/5 transition-colors"
        >
          How It Works
        </motion.button>
      </motion.div>
      
      {/* Device showcase image */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="mt-10 max-w-sm mx-auto"
      >
        <Image 
          src="https://placehold.co/800x500/B8E4F0/2F2F5D?text=App+Screenshot" 
          alt="App screenshot" 
          width={800} 
          height={500}
          className="w-full h-auto rounded-2xl shadow-lg" 
        />
      </motion.div>
      
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ArrowDown className="text-soft-purple dark:text-light-lavender w-6 h-6" />
        </motion.div>
      </motion.div>
    </section>
  );
} 