"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import MenuBar from '@/components/MenuBar';
import Image from 'next/image';

type LeaderboardEntry = {
  userId: string;
  userName: string;
  userEmail: string;
  userImage?: string;
  points: number;
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardType, setLeaderboardType] = useState<string>('all-time');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Helper function to format large numbers
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  // Fetch leaderboard data
  useEffect(() => {
    fetchLeaderboard();
  }, [leaderboardType, page]);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const offset = (page - 1) * limit;
      
      const response = await fetch(`/api/leaderboard?type=${leaderboardType}&limit=${limit}&offset=${offset}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }
      
      const data = await response.json();
      
      setLeaderboard(data.leaderboard || []);
      setUserRank(data.userRank || null);
      setTotalPages(Math.ceil((data.total || 0) / limit));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Render leaderboard position medals or numbers
  const renderPosition = (index: number) => {
    const position = (page - 1) * limit + index + 1;
    
    if (position === 1) {
      return <div className="w-8 h-8 rounded-full bg-lemon-yellow flex items-center justify-center text-deep-navy">🥇</div>;
    } else if (position === 2) {
      return <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-deep-navy">🥈</div>;
    } else if (position === 3) {
      return <div className="w-8 h-8 rounded-full bg-soft-mint/30 flex items-center justify-center text-deep-navy">🥉</div>;
    } 
    return <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">{position}</div>;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <MenuBar />
      
      {/* Header with background */}
      <div className="pt-20 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-playful">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-white opacity-10 rounded-full"></div>
          <div className="absolute left-12 bottom-0 w-32 h-32 bg-white opacity-10 rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold font-fredoka text-white mb-4">Global Leaderboard</h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              See how you rank against other believers from churches around the world!
            </p>
            
            {/* User's rank if available */}
            {userRank && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl"
              >
                <Trophy className="w-5 h-5 text-lemon-yellow" /> 
                <span className="text-white font-medium">
                  {userRank === 1 
                    ? 'You\'re #1 in the world!' 
                    : `Your Global Rank: #${userRank}`}
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4">
        <Card className="border-none shadow-playful rounded-2xl overflow-hidden">
          <div className="p-6 md:p-8">
            {/* Filter options */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold font-fredoka text-foreground">Top Players</h2>
              
              <div className="flex gap-2">
                <button 
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${leaderboardType === 'all-time' ? 'bg-primary text-white' : 'bg-background hover:bg-primary/10'}`}
                  onClick={() => {
                    setLeaderboardType('all-time');
                    setPage(1);
                  }}
                >
                  All Time
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${leaderboardType === 'monthly' ? 'bg-primary text-white' : 'bg-background hover:bg-primary/10'}`}
                  onClick={() => {
                    setLeaderboardType('monthly');
                    setPage(1);
                  }}
                >
                  Monthly
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${leaderboardType === 'weekly' ? 'bg-primary text-white' : 'bg-background hover:bg-primary/10'}`}
                  onClick={() => {
                    setLeaderboardType('weekly');
                    setPage(1);
                  }}
                >
                  Weekly
                </button>
              </div>
            </div>
            
            {/* Leaderboard content */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-20 text-foreground/70">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-foreground/30" />
                <h3 className="text-lg font-medium mb-2">No leaderboard data yet</h3>
                <p>Be the first to complete games and earn points!</p>
              </div>
            ) : (
              <div className="space-y-3 mb-8">
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-background rounded-xl flex items-center"
                  >
                    {renderPosition(index)}
                    
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center ml-3 mr-4 overflow-hidden">
                      {entry.userImage ? (
                        <Image 
                          src={entry.userImage} 
                          alt={entry.userName} 
                          width={48}
                          height={48}
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="font-bold text-primary text-lg">
                          {entry.userName.charAt(0)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium">{entry.userName}</p>
                      <p className="text-sm text-foreground/70">{entry.userEmail}</p>
                    </div>
                    
                    <div className="flex items-center bg-lemon-yellow/20 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 text-primary mr-1" />
                      <span className="font-bold">{formatNumber(entry.points)}</span>
                      <span className="ml-1 text-foreground/70 text-sm">pts</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`p-2 rounded-lg ${page === 1 ? 'text-foreground/30' : 'text-foreground hover:bg-background'}`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <span className="text-foreground/70">
                  Page {page} of {totalPages}
                </span>
                
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`p-2 rounded-lg ${page === totalPages ? 'text-foreground/30' : 'text-foreground hover:bg-background'}`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
