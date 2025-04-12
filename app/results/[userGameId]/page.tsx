"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Check, X, Home, RotateCcw, Share2, Award, Star, Medal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Types for our data
type QuestionSummary = {
  id: string;
  question: string;
  isCorrect: boolean;
  pointsEarned: number;
  userAnswer: string | string[] | number | Record<string, string>;
  correctAnswer: string | string[] | number | Record<string, string>;
};

type GameResult = {
  id: string;
  gameId: string;
  title: string;
  churchName: string;
  totalPoints: number;
  earnedPoints: number;
  scorePercentage: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  questionSummaries: QuestionSummary[];
  completedAt: Date;
};

type LeaderboardEntry = {
  userId: string;
  userName: string;
  userEmail: string;
  userImage?: string;
  points?: number;
  score?: number;
  timeSpentSeconds?: number;
};

// Helper function to format time
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function ResultsPage({ params }: { params: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId');
  const { userGameId } = params;
  
  const [result, setResult] = useState<GameResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardType, setLeaderboardType] = useState<string>('game');
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  // Fetch game results
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        const queryParam = userGameId !== 'latest' 
          ? `userGameId=${userGameId}` 
          : `gameId=${gameId}`;
        
        const response = await fetch(`/api/games/user-game?${queryParam}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch results');
        }
        
        const data = await response.json();
        setResult(data.result);
        
        // Fetch leaderboard after getting results
        fetchLeaderboard('game');
      } catch (error) {
        console.error('Error loading results:', error);
        toast.error('Failed to load results');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [userGameId, gameId]);

  // Fetch leaderboard
  const fetchLeaderboard = async (type: string) => {
    if (!result) return;
    
    try {
      setIsLoadingLeaderboard(true);
      setLeaderboardType(type);
      
      let url = `/api/leaderboard?type=${type}`;
      
      if (type === 'game') {
        url += `&gameId=${result.gameId}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data = await response.json();
      setLeaderboard(data.leaderboard);
      setUserRank(data.userRank);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="w-20 h-20 relative">
          <div className="absolute inset-0 rounded-full bg-gradient-playful opacity-20 animate-pulse"></div>
          <div className="absolute inset-3 rounded-full bg-gradient-playful opacity-40 animate-pulse"></div>
          <div className="absolute inset-6 rounded-full bg-gradient-playful opacity-60 animate-pulse"></div>
        </div>
        <p className="mt-6 text-foreground/70 font-medium">Calculating your results...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="w-20 h-20 bg-light-coral/20 rounded-full flex items-center justify-center">
          <X className="w-10 h-10 text-light-coral" />
        </div>
        <h2 className="mt-6 text-xl font-bold">Results not found</h2>
        <p className="mt-2 text-foreground/70">We couldn't find results for this game.</p>
        <button
          onClick={() => router.push('/home')}
          className="mt-8 px-6 py-3 bg-primary text-white rounded-xl font-bold"
        >
          Return Home
        </button>
      </div>
    );
  }

  const getScoreMessage = () => {
    if (result.scorePercentage >= 90) return "Amazing job!";
    if (result.scorePercentage >= 75) return "Great work!";
    if (result.scorePercentage >= 50) return "Good effort!";
    return "Keep learning!";
  };

  // Render leaderboard item with medal or position
  const renderLeaderboardPosition = (index: number) => {
    if (index === 0) {
      return <div className="w-6 h-6 rounded-full bg-lemon-yellow flex items-center justify-center text-deep-navy">🥇</div>;
    } else if (index === 1) {
      return <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center text-deep-navy">🥈</div>;
    } else if (index === 2) {
      return <div className="w-6 h-6 rounded-full bg-soft-mint/30 flex items-center justify-center text-deep-navy">🥉</div>;
    } 
    return <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{index + 1}</div>;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Confetti celebration for high scores */}
      {result.scorePercentage >= 75 && (
        <div className="fixed inset-0 pointer-events-none z-10">
          {/* We'd add confetti animation here in a real app */}
        </div>
      )}
      
      {/* Header with score */}
      <div className="bg-gradient-playful pt-12 pb-20 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-white opacity-10 rounded-full"></div>
        <div className="absolute left-12 bottom-0 w-32 h-32 bg-white opacity-10 rounded-full"></div>
        
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold font-fredoka text-white mb-2">Game Complete!</h1>
            <p className="text-white/80 text-lg">{result.title}</p>
            
            <div className="mt-8 flex justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 15,
                  delay: 0.3 
                }}
                className="relative"
              >
                <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">{result.scorePercentage}%</div>
                    <div className="text-white/80 text-sm">Score</div>
                  </div>
                </div>
                
                {/* Gold star for 90%+ scores */}
                {result.scorePercentage >= 90 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.8, type: "spring" }}
                    className="absolute -top-4 -right-4 bg-lemon-yellow text-deep-navy w-10 h-10 rounded-full flex items-center justify-center shadow-playful"
                  >
                    <Star className="w-6 h-6" />
                  </motion.div>
                )}
              </motion.div>
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-white text-xl font-medium"
            >
              {getScoreMessage()}
            </motion.p>

            {/* Display user rank if available */}
            {userRank && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="mt-4 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full"
              >
                <Trophy className="w-4 h-4 text-lemon-yellow" /> 
                <span className="text-white">
                  {userRank === 1 ? 'You\'re #1!' : `Rank #${userRank}`}
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
      
      {/* Results summary card */}
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: -40, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-none shadow-playful rounded-2xl overflow-hidden -mt-20">
            <div className="p-6 md:p-8">
              <Tabs defaultValue="results">
                <TabsList className="mb-6 w-full justify-center">
                  <TabsTrigger value="results">Results</TabsTrigger>
                  <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                </TabsList>
                
                <TabsContent value="results">
                  <h2 className="text-xl font-bold font-fredoka text-foreground mb-6">Results Summary</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="text-center p-4 bg-background rounded-xl">
                      <div className="text-2xl font-bold text-primary mb-1">{result.earnedPoints}</div>
                      <div className="text-foreground/70 text-sm">Points Earned</div>
                    </div>
                    
                    <div className="text-center p-4 bg-background rounded-xl">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {result.correctAnswers}/{result.totalQuestions}
                      </div>
                      <div className="text-foreground/70 text-sm">Correct Answers</div>
                    </div>
                    
                    <div className="text-center p-4 bg-background rounded-xl">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {formatTime(result.timeSpentSeconds)}
                      </div>
                      <div className="text-foreground/70 text-sm">Time Spent</div>
                    </div>
                    
                    <div className="text-center p-4 bg-background rounded-xl">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {new Date(result.completedAt).toLocaleDateString()}
                      </div>
                      <div className="text-foreground/70 text-sm">Completed</div>
                    </div>
                  </div>
                  
                  {/* Question results */}
                  <h3 className="text-lg font-bold font-fredoka text-foreground mb-4">Question Breakdown</h3>
                  
                  <div className="space-y-3 mb-8">
                    {result.questionSummaries.map((question, index) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                        className={`p-4 rounded-xl ${
                          question.isCorrect ? 'bg-soft-mint/10' : 'bg-light-coral/10'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3 ${
                            question.isCorrect ? 'bg-soft-mint/20' : 'bg-light-coral/20'
                          }`}>
                            {question.isCorrect ? (
                              <Check className="w-5 h-5 text-soft-mint" />
                            ) : (
                              <X className="w-5 h-5 text-light-coral" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-foreground font-medium line-clamp-1">
                              {question.question}
                            </p>
                            {question.isCorrect ? (
                              <div className="text-soft-mint text-sm flex items-center mt-1">
                                <Award className="w-3 h-3 mr-1" /> +{question.pointsEarned} points
                              </div>
                            ) : (
                              <p className="text-light-coral text-sm mt-1">
                                0 points
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="leaderboard">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold font-fredoka text-foreground">Leaderboard</h2>
                    
                    <div className="flex gap-2">
                      <button 
                        className={`px-3 py-1 text-sm rounded-lg ${leaderboardType === 'game' ? 'bg-primary text-white' : 'bg-background'}`}
                        onClick={() => fetchLeaderboard('game')}
                      >
                        This Game
                      </button>
                      <button 
                        className={`px-3 py-1 text-sm rounded-lg ${leaderboardType === 'all-time' ? 'bg-primary text-white' : 'bg-background'}`}
                        onClick={() => fetchLeaderboard('all-time')}
                      >
                        All Time
                      </button>
                      <button 
                        className={`px-3 py-1 text-sm rounded-lg ${leaderboardType === 'weekly' ? 'bg-primary text-white' : 'bg-background'}`}
                        onClick={() => fetchLeaderboard('weekly')}
                      >
                        Weekly
                      </button>
                    </div>
                  </div>
                  
                  {isLoadingLeaderboard ? (
                    <div className="flex justify-center py-10">
                      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="space-y-3 mb-8">
                      {leaderboard.length === 0 ? (
                        <div className="text-center py-10 text-foreground/70">
                          No leaderboard data available
                        </div>
                      ) : (
                        leaderboard.map((entry, index) => (
                          <div
                            key={entry.userId}
                            className="p-4 bg-background rounded-xl flex items-center"
                          >
                            {renderLeaderboardPosition(index)}
                            
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ml-3 mr-4 overflow-hidden">
                              {entry.userImage ? (
                                <img 
                                  src={entry.userImage} 
                                  alt={entry.userName} 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <div className="font-bold text-primary">
                                  {entry.userName.charAt(0)}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <p className="font-medium">{entry.userName}</p>
                              <p className="text-sm text-foreground/70">{entry.userEmail}</p>
                            </div>
                            
                            <div className="flex flex-col items-end">
                              <div className="font-bold text-primary">
                                {leaderboardType === 'game' ? 
                                  `${entry.score} pts` : 
                                  `${entry.points} pts`
                                }
                              </div>
                              {leaderboardType === 'game' && entry.timeSpentSeconds && (
                                <div className="text-sm text-foreground/60">
                                  {formatTime(entry.timeSpentSeconds)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => router.push('/home')}
                  className="flex items-center justify-center py-3 px-4 rounded-xl bg-background border border-border text-foreground font-medium"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Home
                </button>
                
                <button
                  onClick={() => router.push(`/play/${result.gameId}`)}
                  className="flex items-center justify-center py-3 px-4 rounded-xl bg-primary text-white font-medium"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Play Again
                </button>
              </div>
              
              {/* Share button */}
              <button
                onClick={() => {
                  const shareText = `I scored ${result.scorePercentage}% on ${result.title}! Play now and see if you can beat me!`;
                  
                  // Use navigator.share if available, otherwise copy to clipboard
                  if (navigator.share) {
                    navigator.share({
                      title: 'My PlayTheWord Score',
                      text: shareText,
                      url: window.location.href,
                    }).catch(console.error);
                  } else {
                    navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
                    toast.success('Copied to clipboard!');
                  }
                }}
                className="mt-4 w-full flex items-center justify-center py-3 px-4 rounded-xl bg-lemon-yellow/70 text-deep-navy font-medium"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share Results
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
