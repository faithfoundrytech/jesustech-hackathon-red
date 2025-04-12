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

// Modified FeatureCard component with shadow and hover effects
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
  delay: number;
}

const FeatureCard = ({ icon, title, description, image, delay }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -10, scale: 1.02, transition: { duration: 0.3 } }}
      className="rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-indigo-950 border border-purple-200 dark:border-indigo-700/40"
    >
      <div className="relative h-48 w-full">
        <Image
          src={image}
          alt={title}
          layout="fill"
          objectFit="cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/70 to-transparent"></div>
      </div>
      
      <div className="p-6 relative">
        <div className="absolute -top-10 right-6 w-16 h-16 rounded-full bg-white dark:bg-indigo-900 flex items-center justify-center shadow-lg border-4 border-white dark:border-indigo-700">
          <div className="text-purple-600 dark:text-purple-400">
            {icon}
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-indigo-950 dark:text-purple-300 mb-3">{title}</h3>
        <p className="text-indigo-900/80 dark:text-purple-200/80">{description}</p>
        
      </div>
    </motion.div>
  );
};

export default function Features() {
  const features = [
    {
      icon: <Gamepad2 size={40} />,
      title: "Gamified Learning",
      description: "Transform sermon content into fun, interactive games that boost retention and engagement.",
      image: "/gamify.jpeg"
    },
    {
      icon: <Upload size={40} />,
      title: "Easy Sermon Upload",
      description: "Pastors can easily upload sermons as text, video, or audio with automatic transcription.",
      image: "/sermon2.jpg"
    },
    {
      icon: <Brain size={40} />,
      title: "AI-Powered Questions",
      description: "Our AI generates various question types - multiple choice, slider questions, and drag-and-drop activities.",
      image: "/aip2.jpg"
    },
    {
      icon: <Trophy size={40} />,
      title: "Rewards System",
      description: "Players earn points they can redeem for real church merchandise, Bibles, or community services.",
      image: "/reward.jpeg"
    },
    {
      icon: <Users size={40} />,
      title: "Community Building",
      description: "Connect church members through friendly competition and shared learning experiences.",
      image: "/buildingcom.jpeg"
    },
    {
      icon: <BarChart4 size={40} />,
      title: "Engagement Analytics",
      description: "Track congregation engagement and sermon retention with insightful analytics.",
      image: "/engagement.jpeg"
    },
  ];

  return (
    <section className="py-16 px-4 md:px-8 bg-gradient-to-br from-white to-purple-50 dark:from-indigo-950 dark:to-purple-950">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto relative"
      >
        {/* Background decoration - purple themed */}
        <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-purple-400/10 blur-md animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-40 right-10 w-32 h-32 rounded-full bg-indigo-500/10 blur-md animate-float" style={{ animationDelay: '1.2s' }}></div>
        <div className="absolute top-1/3 left-1/4 w-16 h-16 rounded-full bg-purple-300/10 blur-md animate-float" style={{ animationDelay: '0.8s' }}></div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12 relative z-10"
        >
          <h2 className="text-2xl md:text-3xl font-poppins font-bold text-indigo-900 dark:text-purple-300 mb-4">
            Engaging Features for Faith Growth
          </h2>
          <p className="text-indigo-800/80 dark:text-purple-200/80 max-w-2xl mx-auto">
            Play The Word combines technology and faith to create meaningful learning experiences for your congregation.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
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