"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      title: "Pastor Uploads Sermon",
      description: "Upload text, video, or audio sermom content with auto-transcription",
    },
    {
      title: "AI Creates Games",
      description: "Our AI analyzes sermon content and creates engaging quizzes and questions",
    },
    {
      title: "Players Engage and Learn",
      description: "Congregants play fun games that reinforce key sermon teachings",
    },
    {
      title: "Earn and Redeem Points",
      description: "Points earned can be redeemed for tangible faith-building rewards",
    },
  ];

  return (
    <section className="py-16 px-4 md:px-8 bg-baby-blue/20 dark:bg-soft-indigo/20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-poppins font-bold text-deep-navy dark:text-light-lavender mb-4">
            How Play The Word Works
          </h2>
          <p className="text-deep-navy/80 dark:text-light-lavender/80 max-w-2xl mx-auto">
            A simple process that creates powerful learning experiences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Steps Column */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="bg-soft-purple dark:bg-coral-pink text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-deep-navy dark:text-light-lavender text-lg mb-1">
                    {step.title}
                  </h3>
                  <p className="text-deep-navy/70 dark:text-light-lavender/70 text-sm">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="mt-4 bg-soft-purple text-white px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-shadow inline-flex items-center gap-2"
            >
              Try It Now <ChevronRight size={16} />
            </motion.button>
          </div>
          
          {/* Mockup/Device Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-cream-white dark:bg-soft-indigo/60 rounded-3xl p-4 shadow-lg mx-auto max-w-xs md:max-w-sm"
          >
            {/* Phone mockup with actual screenshot placeholder */}
            <div className="aspect-[9/16] rounded-2xl overflow-hidden relative">
              <Image
                src="https://placehold.co/750x1334/A88BFE/FFFFFF?text=Mobile+App+Screen"
                alt="Mobile App Interface"
                width={750}
                height={1334}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay game elements */}
              <div className="absolute inset-0">
                <div className="absolute top-8 left-0 right-0 flex justify-center">
                  <Image
                    src="https://placehold.co/350x60/FFFFFF/2F2F5D?text=Quiz+Title"
                    alt="Quiz Header"
                    width={350} 
                    height={60}
                    className="rounded-full"
                  />
                </div>
                
                <div className="absolute top-28 left-0 right-0 flex justify-center">
                  <div className="grid grid-cols-2 gap-3 w-[80%]">
                    {[
                      "https://placehold.co/160x120/FFD6A5/2F2F5D?text=Option+1",
                      "https://placehold.co/160x120/B8E4F0/2F2F5D?text=Option+2",
                      "https://placehold.co/160x120/C5FAD5/2F2F5D?text=Option+3",
                      "https://placehold.co/160x120/F9F871/2F2F5D?text=Option+4"
                    ].map((src, i) => (
                      <motion.div 
                        key={i}
                        animate={{ opacity: [0.8, 1, 0.8] }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          delay: i * 0.5,
                          ease: "easeInOut" 
                        }}
                      >
                        <Image
                          src={src}
                          alt={`Game option ${i+1}`}
                          width={160}
                          height={120}
                          className="rounded-xl"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <motion.div 
                  className="absolute bottom-16 left-0 right-0 flex justify-center"
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Image
                    src="https://placehold.co/200x50/FFFFFF/A88BFE?text=Submit+Answer"
                    alt="Submit button"
                    width={200}
                    height={50}
                    className="rounded-full"
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional workflow visual */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              "https://placehold.co/300x200/A88BFE/FFFFFF?text=Pastor+Dashboard",
              "https://placehold.co/300x200/FFD6A5/2F2F5D?text=Content+Analysis",
              "https://placehold.co/300x200/B8E4F0/2F2F5D?text=Game+Creation",
              "https://placehold.co/300x200/C5FAD5/2F2F5D?text=User+Engagement"
            ].map((src, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="relative"
              >
                <Image
                  src={src}
                  alt={`Workflow step ${i+1}`}
                  width={300}
                  height={200}
                  className="w-full h-auto rounded-xl shadow-md"
                />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-soft-purple dark:bg-coral-pink text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {i+1}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
} 