"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Play, Award, Zap, Calendar, ChevronRight, BookOpen, Star, Trophy } from "lucide-react";
import MenuBar from "@/components/MenuBar";
import GameList from "@/components/GameList";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function HomePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    } else if (isLoaded) {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <motion.div 
          className="w-20 h-20 relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-playful opacity-20"></div>
          <div className="animate-pulse-custom absolute inset-2 rounded-full bg-gradient-playful opacity-40"></div>
          <div className="absolute inset-4 rounded-full bg-gradient-playful opacity-60"></div>
          <div className="absolute inset-6 rounded-full bg-background"></div>
        </motion.div>
        <p className="mt-6 text-foreground/70 font-medium text-lg">Loading your spiritual journey...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <MenuBar />
      
      {/* Welcome Banner */}
      <div className="pt-20 pb-6 bg-gradient-playful relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-white opacity-10 rounded-full"></div>
        <div className="absolute left-12 bottom-0 w-32 h-32 bg-white opacity-10 rounded-full"></div>
        
        <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <motion.h1 
                className="text-2xl md:text-3xl font-bold font-fredoka mb-3 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Welcome back, {user?.firstName || "Friend"}! ✨
              </motion.h1>
              <motion.p 
                className="text-white/90 max-w-md text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Ready to deepen your sermon knowledge through fun quizzes and games?
              </motion.p>
            </div>

            <motion.div
              className="flex space-x-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-2xl">
                <p className="text-white/80 text-sm font-medium mb-1">Total Points</p>
                <div className="flex items-center">
                  <Trophy className="w-5 h-5 text-lemon-yellow mr-2" />
                  <span className="text-white text-xl font-bold">500</span>
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-2xl">
                <p className="text-white/80 text-sm font-medium mb-1">Current Streak</p>
                <div className="flex items-center">
                  <Zap className="w-5 h-5 text-warm-peach mr-2" />
                  <span className="text-white text-xl font-bold">3 days</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Daily Streaks */}
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          className="bg-gradient-peach rounded-3xl p-4 -mt-6 shadow-playful relative z-20 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold font-fredoka text-deep-navy">Keep your streak alive!</h3>
            <span className="flex items-center text-deep-navy/70 text-sm font-medium">
              <Calendar className="w-4 h-4 mr-1" /> Day 3 of 7
            </span>
          </div>
          
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div key={day} className="flex-1 relative">
                <div className={`h-2.5 rounded-full ${day <= 3 ? 'bg-deep-navy/80' : 'bg-deep-navy/20'}`}></div>
                {day <= 3 && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-deep-navy rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-sm text-deep-navy/70 text-center">
            Play daily to earn a <span className="font-bold">50 point bonus</span> at the end of the week!
          </div>
        </motion.div>

        {/* Featured Game Card */}
        <motion.div 
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold font-fredoka text-foreground flex items-center">
              <Star className="text-lemon-yellow w-7 h-7 mr-2 animate-pulse-custom" />
              Featured Game
            </h2>
            <button 
              onClick={() => router.push('/all-games')}
              className="text-primary font-medium text-sm flex items-center"
            >
              See all games <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <Card className="border-none overflow-hidden shadow-playful hover:shadow-playful-hover transition-shadow duration-300">
            <div className="bg-gradient-mint relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="p-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="bg-white/30 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-deep-navy mr-2">
                        Pastor John
                      </div>
                      <div className="bg-white/30 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-deep-navy">
                        <BookOpen className="w-3 h-3 inline mr-1" /> John 3:16
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 text-deep-navy">Faith Foundations Challenge</h3>
                    <p className="text-deep-navy/80 mb-4 max-w-xl">Test your knowledge on the foundations of faith with this week's engaging sermon-based quiz.</p>
                    
                    <div className="flex items-center text-deep-navy/70 text-sm mb-4">
                      <Award className="w-4 h-4 mr-1" /> 
                      Earn up to <span className="font-bold text-deep-navy mx-1">100 points</span> and unlock special rewards!
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <motion.div 
                      className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-playful shadow-playful flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="absolute inset-1 rounded-full bg-white/90"></div>
                      <Play className="w-8 h-8 text-soft-purple relative z-10" />
                    </motion.div>
                  </div>
                </div>
                
                <button 
                  onClick={() => router.push('/play/featured')}
                  className="w-full mt-4 bg-deep-navy text-white py-4 rounded-xl text-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Playing
                </button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border-none shadow-playful hover:shadow-playful-hover transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-soft-purple/10 flex items-center justify-center mr-4">
                  <Trophy className="h-6 w-6 text-soft-purple" />
                </div>
                <div>
                  <p className="text-foreground/70 text-sm mb-1">Total Points</p>
                  <h3 className="text-2xl font-bold font-fredoka text-foreground">500</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-playful hover:shadow-playful-hover transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-warm-peach/10 flex items-center justify-center mr-4">
                  <Zap className="h-6 w-6 text-warm-peach" />
                </div>
                <div>
                  <p className="text-foreground/70 text-sm mb-1">Games Played</p>
                  <h3 className="text-2xl font-bold font-fredoka text-foreground">12</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-playful hover:shadow-playful-hover transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-baby-blue/20 flex items-center justify-center mr-4">
                  <BookOpen className="h-6 w-6 text-baby-blue" />
                </div>
                <div>
                  <p className="text-foreground/70 text-sm mb-1">Bible Verses</p>
                  <h3 className="text-2xl font-bold font-fredoka text-foreground">37</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Games */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold font-fredoka text-foreground">Available Games</h2>
            <div className="px-3 py-1 bg-lemon-yellow/30 rounded-full">
              <p className="text-sm text-foreground font-medium">
                Play to earn points!
              </p>
            </div>
          </div>
          
          <GameList />
        </motion.div>
      </div>
    </div>
  );
}
