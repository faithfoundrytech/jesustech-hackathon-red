"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Play, Award, Zap, Calendar, ChevronRight, BookOpen, Star, Trophy, ExternalLink } from "lucide-react";
import MenuBar from "@/components/MenuBar";
import GameList from "@/components/GameList";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";

interface UserMetrics {
  gamesCount: number;
  pointsBalance: number;
}

export default function HomePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<UserMetrics>({ gamesCount: 0, pointsBalance: 0 });
  const [isMetricsLoading, setIsMetricsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    } else if (isLoaded) {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchUserMetrics();
    }
  }, [isLoaded, isSignedIn]);

  const fetchUserMetrics = async () => {
    try {
      setIsMetricsLoading(true);
      const response = await fetch('/api/games/user/metrics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user metrics');
      }
      
      const data = await response.json();
      setMetrics({
        gamesCount: data.gamesCount || 0,
        pointsBalance: data.pointsBalance || 0
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setIsMetricsLoading(false);
    }
  };

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
      
      {/* Welcome Banner with Background Image */}
      <div className="pt-20 pb-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-playful">
          <Image
            src="/jesus-tech-hackathon.png"
            alt="Background"
            fill
            className="object-cover mix-blend-overlay opacity-20" 
            priority
          />
        </div>
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
              
              <motion.a
                href="https://blessed-marketplace-glow.lovable.app"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center px-6 py-3 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-warm-peach via-lemon-yellow to-soft-mint"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Trophy className="w-5 h-5 mr-2" />
                Redeem Points In Shop
                <ExternalLink className="w-4 h-4 ml-2" />
              </motion.a>
            </div>

            <motion.div
              className="flex space-x-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-2xl cursor-pointer hover:bg-white/30 transition-colors" 
                onClick={() => router.push('/leaderboard')}>
                <p className="text-white/80 text-sm font-medium mb-1">Total Points</p>
                <div className="flex items-center">
                  <Trophy className="w-5 h-5 text-lemon-yellow mr-2" />
                  <span className="text-white text-xl font-bold">
                    {isMetricsLoading ? (
                      <Skeleton className="h-6 w-14 bg-white/20" />
                    ) : (
                      metrics.pointsBalance
                    )}
                  </span>
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-2xl">
                <p className="text-white/80 text-sm font-medium mb-1">Games Played</p>
                <div className="flex items-center">
                  <Zap className="w-5 h-5 text-warm-peach mr-2" />
                  <span className="text-white text-xl font-bold">
                    {isMetricsLoading ? (
                      <Skeleton className="h-6 w-14 bg-white/20" />
                    ) : (
                      metrics.gamesCount
                    )}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-12">
       

      

        {/* Available Games */}
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
