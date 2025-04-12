"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      title: "Pastor Uploads Sermon",
      description: "Upload text, video, or audio sermon content with auto-transcription",
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

  const quizQuestion = "In Jesus' Parable of the Sower, what do the seeds represent?";
  const quizOptions = [
    { text: "God's Blessings", color: "bg-purple-800/80" },
    { text: "The Word of God", color: "bg-purple-700/80" },
    { text: "Faith and Prayer", color: "bg-purple-600/80" },
    { text: "Different Churches", color: "bg-purple-500/80" },
  ];

  return (
    <section className="py-16 px-4 md:px-8 bg-grey text-purple-100">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-poppins font-bold text-purple-100 mb-4">
            How Play The Word Works
          </h2>
          <p className="text-purple-300 max-w-2xl mx-auto">
            A simple process that creates powerful learning experiences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
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
                <div className="bg-purple-700 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-purple-100 text-lg mb-1">
                    {step.title}
                  </h3>
                  <p className="text-purple-300 text-sm">
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
              className="mt-4 bg-purple-950 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-shadow inline-flex items-center gap-2"
            >
              Try It Now <ChevronRight size={16} />
            </motion.button>
          </div>
            <div className="flex justify-center">
            <Image
              src="/triviaquiz.png"
              alt="Illustration of How It Works"
              width={500}
              height={300}
              className="rounded-lg shadow-lg"
            />
            </div>

        </div>

        <motion.div
  initial={{ y: 30, opacity: 0 }}
  whileInView={{ y: 0, opacity: 1 }}
  viewport={{ once: true }}
  transition={{ delay: 0.4 }}
  className="mt-20"
>
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {[
      { text: "Pastor Dashboard", color: "bg-gray-800", image: "/pstdash.png" },
      { text: "Content Analysis", color: "bg-gray-800", image: "/content.jpg" },
      { text: "Game Creation", color: "bg-gray-800", image: "/trivia.jpg" },
      { text: "User Engagement", color: "bg-gray-800", image: "/user.jpg" }
    ].map((step, i) => (
      <motion.div
        key={i}
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 * i }}
        className="relative"
      >
        <div className={`${step.color} w-full h-48 rounded-xl shadow-md flex items-center justify-center overflow-hidden`}>
          <Image
            src={step.image}
            alt={step.text}
            layout="fill"
            objectFit="cover"
            className="rounded-xl"
          />
          <p className="absolute text-white font-bold text-lg bg-black/50 px-2 py-1 rounded">
            {step.text}
          </p>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold">
          {i + 1}
        </div>
      </motion.div>
    ))}
  </div>
</motion.div>



      </div>
    </section>
  );
}