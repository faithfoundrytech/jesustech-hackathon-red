"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Church, Users } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-purple-900/10 dark:bg-purple-900/20 p-8 rounded-3xl relative overflow-hidden"
          >
            {/* Background image */}
            <div className="absolute top-0 right-0 w-full h-full opacity-10 z-0">
              <Image 
                src="https://placehold.co/600x400/4B0082/FFFFFF?text=Pastor+Background" 
                alt="Church background" 
                fill 
                className="object-cover"
              />
            </div>
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-900/20 dark:bg-purple-900/30 rounded-full -mr-10 -mt-10 z-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-900/20 dark:bg-purple-900/30 rounded-full -ml-10 -mb-10 z-10"></div>
            
            <div className="p-4 bg-purple-700 text-white rounded-2xl inline-block mb-4 relative z-20">
              <Church size={28} />
            </div>
            
            <h3 className="text-xl font-poppins font-bold text-purple-100 mb-3 relative z-20">
              For Churches & Pastors
            </h3>
            
            <p className="text-purple-300 mb-6 relative z-20">
              Boost sermon retention and engage your younger members through interactive, faith-building games.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 font-semibold text-purple-400 relative z-20"
            >
              Learn more <ArrowRight size={16} />
            </motion.button>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-purple-800/10 dark:bg-purple-800/20 p-8 rounded-3xl relative overflow-hidden"
          >
            {/* Background image */}
            <div className="absolute top-0 right-0 w-full h-full opacity-10 z-0">
              <Image 
                src="https://placehold.co/600x400/6A0DAD/FFFFFF?text=Congregation+Background" 
                alt="Congregation background" 
                fill 
                className="object-cover"
              />
            </div>
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-800/20 dark:bg-purple-800/30 rounded-full -mr-10 -mt-10 z-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-800/20 dark:bg-purple-800/30 rounded-full -ml-10 -mb-10 z-10"></div>
            
            <div className="p-4 bg-purple-700 text-white rounded-2xl inline-block mb-4 relative z-20">
              <Users size={28} />
            </div>
            
            <h3 className="text-xl font-poppins font-bold text-purple-100 mb-3 relative z-20">
              For Congregations
            </h3>
            
            <p className="text-purple-300 mb-6 relative z-20">
              Make learning fun and earn rewards while deepening your understanding of weekly sermons.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 font-semibold text-purple-400 relative z-20"
            >
              Get started <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-gradient-to-r from-purple-900 to-purple-700 text-white p-8 md:p-12 rounded-3xl text-center relative overflow-hidden"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full">
              <Image 
                src="https://placehold.co/1200x600/4B0082/FFFFFF?text=Pattern" 
                alt="Background pattern" 
                fill 
                className="object-cover"
              />
            </div>
          </div>
          
          {/* Device mockups */}
          <div className="absolute -right-10 bottom-0 opacity-20 w-64 h-64 md:w-80 md:h-80 pointer-events-none hidden md:block">
            <Image 
              src="https://placehold.co/500x500/4B0082/FFFFFF?text=Device" 
              alt="Device mockup" 
              width={500}
              height={500}
              className="w-full h-full object-contain"
            />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-poppins font-bold mb-4 relative z-10">
            Ready to transform sermon engagement?
          </h2>
          <p className="mb-8 max-w-2xl mx-auto opacity-90 relative z-10">
            Join the Play The Word community and help your congregation retain and apply sermon teachings in a fun, interactive way.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-shadow relative z-10"
          >
            Join The Beta
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}