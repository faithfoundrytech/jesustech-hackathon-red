"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Church, Play, ChevronRight, Users, Clock, Award, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

// Types from our models
interface Church {
  _id: string;
  name: string;
  location: string;
  description: string;
  imageUrl?: string;
}

interface Game {
  _id: string;
  churchId: string;
  title: string;
  description?: string;
  metadata: {
    title: string;
    preacher?: string;
    date?: string;
    mainVerses?: string[];
  };
  pointsAvailable: number;
  status: string;
}

export default function GameList() {
  const [isLoading, setIsLoading] = useState(true);
  const [churches, setChurches] = useState<Church[]>([]);
  const [gamesByChurch, setGamesByChurch] = useState<Record<string, Game[]>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch games from API
    const fetchGames = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/games');
        
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }
        
        const data = await response.json();
        
        // Debug the received data
        console.log("API response:", data);
        
        // Group games by church
        const groupedGames: Record<string, Game[]> = {};
        
        data.games.forEach((game: Game) => {
          const churchId = game.churchId.toString();
          if (!groupedGames[churchId]) {
            groupedGames[churchId] = [];
          }
          groupedGames[churchId].push(game);
        });
        
        setChurches(data.churches);
        setGamesByChurch(groupedGames);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching games:", error);
        setError("Failed to load games. Please try again.");
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (isLoading) {
    return <GameListSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8 bg-light-coral/10 rounded-2xl p-6">
        <p className="text-foreground text-lg mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity shadow-playful"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (churches.length === 0) {
    return (
      <div className="text-center py-10 bg-baby-blue/10 rounded-2xl border border-baby-blue/20 p-8">
        <div className="w-20 h-20 bg-baby-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Church className="h-10 w-10 text-baby-blue" />
        </div>
        <h3 className="text-foreground text-xl font-bold mb-2">No Games Available</h3>
        <p className="text-foreground/70 max-w-md mx-auto">Check back later for new games or contact your church administrator to add games.</p>
      </div>
    );
  }

  const getChurchBackground = (index: number) => {
    const backgrounds = [
      "bg-gradient-playful",
      "bg-gradient-peach",
      "bg-gradient-mint"
    ];
    return backgrounds[index % backgrounds.length];
  };

  return (
    <div className="space-y-12">
      {churches.map((church, index) => {
        // Get church ID as string for lookup
        const churchId = church._id.toString();
        const churchGames = gamesByChurch[churchId] || [];
        const churchBg = getChurchBackground(index);
        
        return (
          <motion.div
            key={church._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="rounded-2xl overflow-hidden shadow-playful"
          >
            <div className={`${churchBg} p-6 relative overflow-hidden`}>
              {/* Background image */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/jesus-tech-hackathon.png"
                  alt={`${church.name} background`}
                  fill
                  className="object-cover mix-blend-overlay opacity-25"
                  priority={index === 0}
                />
              </div>
              
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-10 w-16 h-16 bg-white opacity-10 rounded-full translate-y-1/2"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Church className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-fredoka text-white">{church.name}</h2>
                    <p className="text-sm text-white/90 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {church.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card p-4">
              {churchGames.length === 0 ? (
                <div className="text-center py-6 bg-background rounded-xl">
                  <p className="text-foreground/60 flex flex-col items-center">
                    <BookOpen className="h-8 w-8 mb-2 text-foreground/40" />
                    No games available for this church
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {churchGames.map((game, gameIndex) => (
                    <motion.div
                      key={game._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 + gameIndex * 0.1 }}
                      className="bg-background rounded-xl overflow-hidden hover:shadow-playful-hover transition-all duration-200 group border border-border"
                    >
                      <Link href={`/play/${game._id}`} className="block">
                        {/* Game cover image */}
                        <div className="relative h-40 w-full overflow-hidden">
                          <Image
                            src="/game.png"
                            alt={game.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background opacity-70"></div>
                          
                          {/* Status badges positioned over the image */}
                          <div className="absolute top-3 left-3 flex items-center space-x-2">
                            {game.status === 'live' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-soft-mint/70 backdrop-blur-sm text-white text-xs font-medium">
                                <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></span>
                                Live
                              </span>
                            )}
                            {game.metadata.preacher && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-baby-blue/70 backdrop-blur-sm text-white text-xs font-medium">
                                {game.metadata.preacher}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-bold font-fredoka text-lg text-foreground group-hover:text-primary transition-colors duration-200">
                                {game.title}
                              </h3>
                              
                              {game.description && (
                                <p className="text-sm text-foreground/70 mt-1 line-clamp-2">
                                  {game.description}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex-shrink-0 ml-4">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <Play className="w-5 h-5 text-primary" />
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {game.metadata.mainVerses?.map((verse, i) => (
                              <span 
                                key={i} 
                                className="inline-flex items-center px-2 py-1 rounded-full bg-lemon-yellow/30 text-foreground text-xs"
                              >
                                <BookOpen className="w-3 h-3 mr-1" /> {verse}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <div className="flex items-center text-foreground/60 text-sm">
                              <Clock className="w-4 h-4 mr-1" /> 5-10 min
                            </div>
                            
                            <div className="flex items-center">
                              <span className="text-primary font-medium text-sm flex items-center mr-3">
                                <Award className="w-4 h-4 mr-1" /> {game.pointsAvailable} pts
                              </span>
                              <span className="text-primary text-sm font-medium flex items-center group-hover:translate-x-1 transition-transform duration-200">
                                Play <ChevronRight className="w-4 h-4 ml-0.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function GameListSkeleton() {
  return (
    <div className="space-y-10">
      {[1, 2].map(i => (
        <div key={i} className="rounded-2xl overflow-hidden shadow-playful">
          {/* Church header skeleton */}
          <div className="bg-gradient-playful p-6 relative">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </div>
          
          {/* Games skeleton */}
          <div className="bg-card p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3].map(j => (
                <div key={j} className="bg-background rounded-xl overflow-hidden border border-border">
                  <Skeleton className="h-40 w-full" />
                  <div className="p-5">
                    <div className="flex justify-between mb-4">
                      <div className="w-3/5">
                        <Skeleton className="h-6 w-full mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                      <Skeleton className="h-12 w-12 rounded-full" />
                    </div>
                    
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    
                    <div className="flex justify-between pt-3 border-t border-border">
                      <Skeleton className="h-4 w-20" />
                      <div className="flex gap-3">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 