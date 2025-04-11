"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Check, X, Home, RotateCcw, Share2, Award, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';

// Dummy data types and data
type QuestionSummary = {
  id: string;
  question: string;
  isCorrect: boolean;
  pointsEarned: number;
  userAnswer: string | string[] | number | Record<string, string>;
  correctAnswer: string | string[] | number | Record<string, string>;
};

type GameResult = {
  gameId: string;
  title: string;
  churchName: string;
  totalPoints: number;
  earnedPoints: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  questionSummaries: QuestionSummary[];
  completedAt: Date;
};

// Dummy data for the game result
const dummyResult: GameResult = {
  gameId: 'game123',
  title: 'Faith Foundations Challenge',
  churchName: 'Grace Community Church',
  totalPoints: 200,
  earnedPoints: 120,
  correctAnswers: 4,
  totalQuestions: 5,
  timeSpentSeconds: 87,
  completedAt: new Date(),
  questionSummaries: [
    {
      id: 'q1',
      question: 'Which verse states "For God so loved the world"?',
      isCorrect: true,
      pointsEarned: 10,
      userAnswer: 'John 3:16',
      correctAnswer: 'John 3:16'
    },
    {
      id: 'q2',
      question: 'Which of the following are Fruits of the Spirit mentioned in Galatians 5:22-23?',
      isCorrect: true,
      pointsEarned: 20,
      userAnswer: ['Love', 'Joy', 'Peace', 'Patience'],
      correctAnswer: ['Love', 'Joy', 'Peace', 'Patience']
    },
    {
      id: 'q3',
      question: 'How many disciples did Jesus have?',
      isCorrect: true,
      pointsEarned: 15,
      userAnswer: 12,
      correctAnswer: 12
    },
    {
      id: 'q4',
      question: 'Match the verse with the correct book of the Bible:',
      isCorrect: false,
      pointsEarned: 0,
      userAnswer: {
        'In the beginning God created the heavens and the earth': 'Exodus',
        'The Lord is my shepherd; I shall not want': 'Psalms',
        'For God so loved the world': 'John'
      },
      correctAnswer: {
        'In the beginning God created the heavens and the earth': 'Genesis',
        'The Lord is my shepherd; I shall not want': 'Psalms',
        'For God so loved the world': 'John'
      }
    },
    {
      id: 'q5',
      question: 'Moses led the Israelites across the Red Sea.',
      isCorrect: true,
      pointsEarned: 10,
      userAnswer: 'True',
      correctAnswer: 'True'
    }
  ]
};

// Helper function to format time
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId');
  
  const [result, setResult] = useState<GameResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadResults = async () => {
      try {
        // In a real app, fetch results from API using gameId
        // For now, use dummy data
        setTimeout(() => {
          setResult(dummyResult);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading results:', error);
        setIsLoading(false);
      }
    };

    loadResults();
  }, [gameId]);

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

  const scorePercentage = Math.round((result.earnedPoints / result.totalPoints) * 100);
  const getScoreMessage = () => {
    if (scorePercentage >= 90) return "Amazing job!";
    if (scorePercentage >= 75) return "Great work!";
    if (scorePercentage >= 50) return "Good effort!";
    return "Keep learning!";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Confetti celebration for high scores */}
      {scorePercentage >= 75 && (
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
                    <div className="text-4xl font-bold text-white">{scorePercentage}%</div>
                    <div className="text-white/80 text-sm">Score</div>
                  </div>
                </div>
                
                {/* Gold star for 90%+ scores */}
                {scorePercentage >= 90 && (
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
                onClick={() => alert('Sharing functionality would go here!')}
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
