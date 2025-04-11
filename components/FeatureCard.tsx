"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  image?: string;
  delay?: number;
}

export default function FeatureCard({ icon, title, description, image, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      className="bg-cream-white dark:bg-soft-indigo rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      {image && (
        <div className="mb-4 -mx-6 -mt-6">
          <Image 
            src={image} 
            alt={title} 
            width={600} 
            height={400} 
            className="w-full h-48 object-cover"
          />
        </div>
      )}
      <div className="mb-4 text-soft-purple dark:text-coral-pink">
        {icon}
      </div>
      <h3 className="text-lg font-poppins font-bold text-deep-navy dark:text-light-lavender mb-2">
        {title}
      </h3>
      <p className="text-sm text-deep-navy/80 dark:text-light-lavender/80">
        {description}
      </p>
    </motion.div>
  );
} 