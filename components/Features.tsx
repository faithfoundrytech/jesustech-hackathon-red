"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Gamepad2, 
  Upload, 
  Brain, 
  Trophy, 
  Users, 
  BarChart4 
} from "lucide-react";
import FeatureCard from "./FeatureCard";

export default function Features() {
  const features = [
    {
      icon: <Gamepad2 size={40} />,
      title: "Gamified Learning",
      description: "Transform sermon content into fun, interactive games that boost retention and engagement.",
      image: "https://placehold.co/600x400/A88BFE/FFFFFF?text=Gamified+Learning"
    },
    {
      icon: <Upload size={40} />,
      title: "Easy Sermon Upload",
      description: "Pastors can easily upload sermons as text, video, or audio with automatic transcription.",
      image: "https://placehold.co/600x400/FFD6A5/FFFFFF?text=Sermon+Upload"
    },
    {
      icon: <Brain size={40} />,
      title: "AI-Powered Questions",
      description: "Our AI generates various question types - multiple choice, slider questions, and drag-and-drop activities.",
      image: "https://placehold.co/600x400/B8E4F0/2F2F5D?text=AI+Questions"
    },
    {
      icon: <Trophy size={40} />,
      title: "Rewards System",
      description: "Players earn points they can redeem for real church merchandise, Bibles, or community services.",
      image: "https://placehold.co/600x400/F9F871/2F2F5D?text=Rewards"
    },
    {
      icon: <Users size={40} />,
      title: "Community Building",
      description: "Connect church members through friendly competition and shared learning experiences.",
      image: "https://placehold.co/600x400/C5FAD5/2F2F5D?text=Community"
    },
    {
      icon: <BarChart4 size={40} />,
      title: "Engagement Analytics",
      description: "Track congregation engagement and sermon retention with insightful analytics.",
      image: "https://placehold.co/600x400/FFADAD/FFFFFF?text=Analytics"
    },
  ];

  return (
    <section className="py-16 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-poppins font-bold text-deep-navy dark:text-light-lavender mb-4">
            Engaging Features for Faith Growth
          </h2>
          <p className="text-deep-navy/80 dark:text-light-lavender/80 max-w-2xl mx-auto">
            Play The Word combines technology and faith to create meaningful learning experiences for your congregation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              image={feature.image}
              delay={index * 0.1}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
} 