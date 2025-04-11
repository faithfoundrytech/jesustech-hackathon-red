"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Check, X, ChevronRight, HelpCircle, ArrowLeft, Star, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

// Types for our question data
type QuestionType = 'single-answer-multiple-choice' | 'multiple-answer-multiple-choice' | 'slider' | 'single-answer-drag-drop' | 'multiple-answer-drag-drop' | 'true-false';

interface VerseBookMapping {
  [verse: string]: string;
}

type Question = {
  id: string;
  type: QuestionType;
  question: string;
  correctAnswer: string | string[] | number | VerseBookMapping;
  fakeAnswers: string[];
  points: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  explanation?: string;
  order: number;
};

type Game = {
  id: string;
  title: string;
  description?: string;
  pointsAvailable: number;
  questionsCount: number;
  churchName: string;
};

type UserAnswer = {
  questionId: string;
  userAnswer: string | string[] | number | VerseBookMapping;
  correct: boolean;
  pointsEarned: number;
};

type UserGame = {
  userId: string;
  gameId: string;
  answers: UserAnswer[];
  score: number;
  status: 'playing' | 'completed' | 'archived';
  startedAt: Date;
  completedAt?: Date;
  timeSpentSeconds?: number;
};

// Dummy data for the game
const dummyGame: Game = {
  id: 'game123',
  title: 'Faith Foundations Challenge',
  description: 'Test your knowledge on the foundations of faith',
  pointsAvailable: 200,
  questionsCount: 5,
  churchName: 'Grace Community Church'
};

// Dummy data for questions
const dummyQuestions: Question[] = [
  {
    id: 'q1',
    type: 'single-answer-multiple-choice',
    question: 'Which verse states "For God so loved the world"?',
    correctAnswer: 'John 3:16',
    fakeAnswers: ['Matthew 5:1', 'Romans 8:28', 'Genesis 1:1'],
    points: 10,
    difficulty: 'easy',
    explanation: 'John 3:16 is one of the most well-known verses in the Bible, often called "the Gospel in a nutshell".',
    order: 1
  },
  {
    id: 'q2',
    type: 'multiple-answer-multiple-choice',
    question: 'Which of the following are Fruits of the Spirit mentioned in Galatians 5:22-23?',
    correctAnswer: ['Love', 'Joy', 'Peace', 'Patience'],
    fakeAnswers: ['Pride', 'Anger', 'Wealth', 'Success'],
    points: 20,
    difficulty: 'medium',
    explanation: 'The Fruits of the Spirit are love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control.',
    order: 2
  },
  {
    id: 'q3',
    type: 'slider',
    question: 'How many disciples did Jesus have?',
    correctAnswer: 12,
    fakeAnswers: [],
    points: 15,
    difficulty: 'easy',
    explanation: 'Jesus had 12 disciples who followed him closely and became his apostles.',
    order: 3
  },
  {
    id: 'q4',
    type: 'single-answer-drag-drop',
    question: 'Match the verse with the correct book of the Bible:',
    correctAnswer: {
      'In the beginning God created the heavens and the earth': 'Genesis',
      'The Lord is my shepherd; I shall not want': 'Psalms',
      'For God so loved the world': 'John'
    } as VerseBookMapping,
    fakeAnswers: ['Matthew', 'Luke', 'Revelation', 'Exodus'],
    points: 30,
    difficulty: 'hard',
    explanation: 'These are some of the most well-known verses from their respective books.',
    order: 4
  },
  {
    id: 'q5',
    type: 'true-false',
    question: 'Moses led the Israelites across the Red Sea.',
    correctAnswer: 'True',
    fakeAnswers: ['False'],
    points: 10,
    difficulty: 'easy',
    explanation: 'Moses did lead the Israelites across the Red Sea as recorded in the book of Exodus.',
    order: 5
  }
];

// Initialize an empty UserGame
const initUserGame = (gameId: string): UserGame => ({
  userId: 'user123',
  gameId,
  answers: [],
  score: 0,
  status: 'playing',
  startedAt: new Date()
});

// Point celebration animation component
const PointCelebration = ({ points }: { points: number }) => {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
    >
      <motion.div
        initial={{ scale: 0.5, y: 0 }}
        animate={{ scale: 2, y: -100 }}
        transition={{ 
          duration: 1.5,
          ease: [0.175, 0.885, 0.32, 1.275] 
        }}
        className="flex items-center justify-center"
      >
        <div className="text-5xl font-bold bg-gradient-to-r from-primary to-soft-mint bg-clip-text text-transparent flex items-center">
          +{points}
          <motion.div
            initial={{ rotate: 0, scale: 0 }}
            animate={{ rotate: 360, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="w-8 h-8 ml-2 text-yellow-400" />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Custom draggable component that doesn't rely on react-draggable
const DraggableItem = ({ 
  children, 
  onDragEnd
}: { 
  children: React.ReactNode, 
  onDragEnd: (x: number, y: number) => void 
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0, mouseX: 0, mouseY: 0 });
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!itemRef.current) return;
    
    setIsDragging(true);
    startPos.current = {
      x: position.x,
      y: position.y,
      mouseX: e.clientX,
      mouseY: e.clientY
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    e.preventDefault();
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const dx = e.clientX - startPos.current.mouseX;
    const dy = e.clientY - startPos.current.mouseY;
    
    setPosition({
      x: startPos.current.x + dx,
      y: startPos.current.y + dy
    });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    onDragEnd(position.x, position.y);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!itemRef.current || e.touches.length !== 1) return;
    
    setIsDragging(true);
    startPos.current = {
      x: position.x,
      y: position.y,
      mouseX: e.touches[0].clientX,
      mouseY: e.touches[0].clientY
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    e.preventDefault();
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    
    const dx = e.touches[0].clientX - startPos.current.mouseX;
    const dy = e.touches[0].clientY - startPos.current.mouseY;
    
    setPosition({
      x: startPos.current.x + dx,
      y: startPos.current.y + dy
    });
    
    e.preventDefault();
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    
    onDragEnd(position.x, position.y);
  };
  
  return (
    <div
      ref={itemRef}
      className={`absolute cursor-grab ${isDragging ? 'cursor-grabbing z-50 opacity-90' : ''}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {children}
    </div>
  );
};

export default function PlayGame({ params }: { params: { gameId: string } }) {
  const router = useRouter();
  const { gameId } = params;
  
  // Game state
  const [game, setGame] = useState<Game>(dummyGame);
  const [questions, setQuestions] = useState<Question[]>(dummyQuestions);
  const [userGame, setUserGame] = useState<UserGame>(initUserGame(gameId));
  
  // UI state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [dragItems, setDragItems] = useState<{[key: string]: string | null}>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackShown, setFeedbackShown] = useState<{[key: string]: boolean}>({});
  const [showPointCelebration, setShowPointCelebration] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  
  // References for drop zones
  const dropZonesRef = useRef<{[key: string]: DOMRect | null}>({});
  const verseContainerRef = useRef<HTMLDivElement>(null);
  
  // Current question
  const currentQuestion = questions[currentQuestionIndex];
  
  // Progress tracking
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  // Check if question has been answered
  const isQuestionAnswered = userGame.answers.some(
    answer => answer.questionId === currentQuestion?.id
  );

  // User is at the end of questions
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  // Setup drag items
  useEffect(() => {
    if (currentQuestion?.type.includes('drag-drop')) {
      const items: {[key: string]: string | null} = {};
      
      if (typeof currentQuestion.correctAnswer === 'object' && !Array.isArray(currentQuestion.correctAnswer)) {
        Object.keys(currentQuestion.correctAnswer as VerseBookMapping).forEach(key => {
          items[key] = null;
        });
      }
      
      setDragItems(items);
    }
  }, [currentQuestion]);

  // Update drop zone positions
  const updateDropZones = () => {
    if (!currentQuestion?.type.includes('drag-drop') || !verseContainerRef.current) return;
    
    const newDropZones: {[key: string]: DOMRect | null} = {};
    
    if (typeof currentQuestion.correctAnswer === 'object' && !Array.isArray(currentQuestion.correctAnswer)) {
      Object.keys(currentQuestion.correctAnswer as VerseBookMapping).forEach(key => {
        const el = document.getElementById(`dropzone-${key}`);
        if (el) {
          newDropZones[key] = el.getBoundingClientRect();
        } else {
          newDropZones[key] = null;
        }
      });
    }
    
    dropZonesRef.current = newDropZones;
  };
  
  useEffect(() => {
    updateDropZones();
    window.addEventListener('resize', updateDropZones);
    
    return () => {
      window.removeEventListener('resize', updateDropZones);
    };
  }, [currentQuestion]);

  // Process and validate user's answer
  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;
    
    let answer: string | string[] | number | VerseBookMapping;
    let correct = false;
    let pointsEarned = 0;
    
    // Get answer based on question type
    switch (currentQuestion.type) {
      case 'single-answer-multiple-choice':
      case 'true-false':
        answer = selectedAnswer as string;
        correct = answer === currentQuestion.correctAnswer;
        break;
        
      case 'multiple-answer-multiple-choice':
        answer = selectedAnswers;
        // Check if arrays match exactly
        const targetAnswers = currentQuestion.correctAnswer as string[];
        correct = targetAnswers.length === selectedAnswers.length && 
                  targetAnswers.every(a => selectedAnswers.includes(a));
        break;
        
      case 'slider':
        answer = sliderValue;
        // Allow a small margin of error for slider
        const targetValue = currentQuestion.correctAnswer as number;
        correct = Math.abs(sliderValue - targetValue) <= 1;
        break;
        
      case 'single-answer-drag-drop':
      case 'multiple-answer-drag-drop':
        answer = {...dragItems} as VerseBookMapping;
        
        if (typeof currentQuestion.correctAnswer === 'object' && !Array.isArray(currentQuestion.correctAnswer)) {
          const correctMapping = currentQuestion.correctAnswer as VerseBookMapping;
          
          // Check if all mappings are correct
          correct = Object.entries(dragItems).every(
            ([key, value]) => value === correctMapping[key]
          );
        }
        break;
        
      default:
        answer = '';
    }
    
    // Calculate points
    pointsEarned = correct ? currentQuestion.points : 0;
    
    // Save answer to userGame
    const updatedAnswers = [
      ...userGame.answers,
      {
        questionId: currentQuestion.id,
        userAnswer: answer,
        correct,
        pointsEarned
      }
    ];
    
    // Update userGame state
    setUserGame({
      ...userGame,
      answers: updatedAnswers,
      score: userGame.score + pointsEarned
    });
    
    // Show feedback
    setIsCorrect(correct);
    setShowFeedback(true);
    setFeedbackShown({...feedbackShown, [currentQuestion.id]: true});
    
    // Show points celebration and toast for correct answers
    if (correct) {
      setEarnedPoints(pointsEarned);
      setShowPointCelebration(true);
      
      setTimeout(() => {
        setShowPointCelebration(false);
      }, 1500);
      
      toast.success(
        <div className="flex items-center">
          <div className="mr-2">
            <Award className="h-5 w-5 text-soft-mint" />
          </div>
          <span>+{pointsEarned} points earned!</span>
        </div>,
        {
          position: "bottom-center",
          duration: 2000,
          className: "bg-gradient-to-r from-primary/20 to-soft-mint/20"
        }
      );
    } else {
      toast.error(
        <div className="flex items-center">
          <X className="h-5 w-5 mr-2" />
          <span>Try again next time!</span>
        </div>,
        {
          position: "bottom-center",
          duration: 2000
        }
      );
    }
  };
  
  // Handle drag end for custom draggable items
  const handleDragEnd = (option: string, x: number, y: number) => {
    // Get the current item position relative to the viewport
    const itemEl = document.getElementById(`drag-item-${option}`);
    if (!itemEl) return;
    
    const itemRect = itemEl.getBoundingClientRect();
    const itemCenterX = itemRect.left + x + itemRect.width / 2;
    const itemCenterY = itemRect.top + y + itemRect.height / 2;
    
    // Check if it's over any drop zone
    let dropped = false;
    
    Object.entries(dropZonesRef.current).forEach(([key, rect]) => {
      if (!rect) return;
      
      // Check if it's inside the drop zone
      if (
        itemCenterX >= rect.left && 
        itemCenterX <= rect.right && 
        itemCenterY >= rect.top && 
        itemCenterY <= rect.bottom
      ) {
        // Drop to this zone
        setDragItems(prev => ({
          ...prev,
          [key]: option
        }));
        
        dropped = true;
        
        // Add a small animation feedback
        const el = document.getElementById(`dropzone-${key}`);
        if (el) {
          el.classList.add('drop-highlight');
          setTimeout(() => {
            el.classList.remove('drop-highlight');
          }, 300);
        }
      }
    });
  };
  
  // Move to next question or finish game
  const handleNextQuestion = () => {
    setShowFeedback(false);
    
    // Reset UI state for next question
    setSelectedAnswer(null);
    setSelectedAnswers([]);
    setSliderValue(0);
    setDragItems({});
    
    if (isLastQuestion) {
      // Complete the game
      const completedUserGame = {
        ...userGame,
        status: 'completed' as const,
        completedAt: new Date(),
        timeSpentSeconds: Math.floor((new Date().getTime() - userGame.startedAt.getTime()) / 1000)
      };
      
      setUserGame(completedUserGame);
      
      // Navigate to results page
      toast.success("Game completed! Viewing your results...", {
        position: "top-center",
        duration: 2000,
      });
      
      setTimeout(() => {
        router.push(`/results?gameId=${gameId}`);
      }, 500);
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  // Toggle selection for multiple choice questions
  const toggleMultipleChoice = (option: string) => {
    setSelectedAnswers(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      } else {
        return [...prev, option];
      }
    });
  };
  
  // Render question based on its type
  const renderQuestion = () => {
    if (!currentQuestion) return null;
    
    switch (currentQuestion.type) {
      case 'single-answer-multiple-choice':
        return (
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-fredoka text-foreground mb-6">{currentQuestion.question}</h2>
            <div className="grid grid-cols-1 gap-3">
              {[...currentQuestion.fakeAnswers, currentQuestion.correctAnswer as string]
                .sort() // Randomize order
                .map((option, index) => (
                  <motion.button
                    key={index}
                    className={`p-4 rounded-xl border-2 font-medium text-left transition-all ${
                      selectedAnswer === option
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-background hover:border-primary/50'
                    }`}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.01 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: index * 0.1 } 
                    }}
                    onClick={() => setSelectedAnswer(option)}
                    disabled={showFeedback}
                  >
                    {option}
                  </motion.button>
                ))}
            </div>
          </div>
        );
        
      case 'multiple-answer-multiple-choice':
        return (
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-fredoka text-foreground mb-6">{currentQuestion.question}</h2>
            <p className="text-sm text-foreground/70 mb-4">Select all that apply</p>
            <div className="grid grid-cols-1 gap-3">
              {[...(currentQuestion.correctAnswer as string[]), ...currentQuestion.fakeAnswers]
                .filter((item, index, self) => self.indexOf(item) === index) // Remove duplicates
                .sort() // Randomize order
                .map((option, index) => (
                  <motion.button
                    key={index}
                    className={`p-4 rounded-xl border-2 font-medium text-left transition-all flex items-center ${
                      selectedAnswers.includes(option)
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-background hover:border-primary/50'
                    }`}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.01 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: index * 0.1 } 
                    }}
                    onClick={() => toggleMultipleChoice(option)}
                    disabled={showFeedback}
                  >
                    <div className={`w-5 h-5 rounded mr-3 flex-shrink-0 ${
                      selectedAnswers.includes(option)
                        ? 'bg-primary text-white flex items-center justify-center'
                        : 'border-2 border-muted-foreground'
                    }`}>
                      {selectedAnswers.includes(option) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <Check className="w-3 h-3" />
                        </motion.div>
                      )}
                    </div>
                    <span>{option}</span>
                  </motion.button>
                ))}
            </div>
          </div>
        );
        
      case 'slider':
        return (
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-fredoka text-foreground mb-6">{currentQuestion.question}</h2>
            <div className="px-4 py-10">
              <div className="mb-12 text-center">
                <motion.span 
                  className="text-4xl font-bold bg-gradient-to-r from-primary to-soft-mint bg-clip-text text-transparent"
                  key={sliderValue}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  {sliderValue}
                </motion.span>
              </div>
              <Slider
                min={0}
                max={20}
                step={1}
                value={[sliderValue]}
                onValueChange={(values) => {
                  setSliderValue(values[0]);
                  
                  // Add a subtle animation when value changes
                  const sliderTrack = document.querySelector('.slider-track');
                  if (sliderTrack) {
                    sliderTrack.classList.add('pulse');
                    setTimeout(() => {
                      sliderTrack.classList.remove('pulse');
                    }, 300);
                  }
                }}
                disabled={showFeedback}
                className="slider-track"
              />
              <div className="flex justify-between mt-2 text-sm text-foreground/50">
                <span>0</span>
                <span>20</span>
              </div>
            </div>
          </div>
        );
        
      case 'single-answer-drag-drop':
      case 'multiple-answer-drag-drop':
        if (typeof currentQuestion.correctAnswer !== 'object' || Array.isArray(currentQuestion.correctAnswer)) 
          return <div>Error: Invalid question format</div>;
          
        const mapping = currentQuestion.correctAnswer as VerseBookMapping;
        const verses = Object.keys(mapping);
        const options = [
          ...Object.values(mapping),
          ...currentQuestion.fakeAnswers
        ].filter((v, i, a) => a.indexOf(v) === i).sort();
        
        return (
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-fredoka text-foreground mb-6">{currentQuestion.question}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3" ref={verseContainerRef}>
                <h3 className="text-lg font-medium text-foreground/80">Verses</h3>
                {verses.map((verse, index) => (
                  <motion.div 
                    key={index}
                    id={`dropzone-${verse}`}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      dragItems[verse] ? 'border-primary bg-primary/10' : 'border-border bg-background'
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { delay: index * 0.1 } 
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-foreground">{verse}</p>
                      {dragItems[verse] && (
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="bg-primary/20 px-3 py-1 rounded-lg text-primary font-medium"
                        >
                          {dragItems[verse]}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="space-y-3 relative" style={{ minHeight: '200px' }}>
                <h3 className="text-lg font-medium text-foreground/80">Drag the correct book</h3>
                {options.map((option, index) => {
                  // Skip options that are already matched
                  if (Object.values(dragItems).includes(option)) return null;
                  
                  return (
                    <DraggableItem
                      key={index}
                      onDragEnd={(x, y) => handleDragEnd(option, x, y)}
                    >
                      <motion.div
                        id={`drag-item-${option}`}
                        className="p-3 rounded-xl bg-lemon-yellow/20 text-foreground font-medium text-center shadow-playful"
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          transition: { delay: 0.3 + index * 0.1 } 
                        }}
                      >
                        {option}
                      </motion.div>
                    </DraggableItem>
                  );
                })}
              </div>
            </div>
          </div>
        );
        
      case 'true-false':
        return (
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-fredoka text-foreground mb-6">{currentQuestion.question}</h2>
            <div className="grid grid-cols-2 gap-4">
              {['True', 'False'].map((option, index) => (
                <motion.button
                  key={index}
                  className={`p-6 rounded-xl border-2 font-medium text-center transition-all ${
                    selectedAnswer === option
                      ? option === 'True' 
                        ? 'border-soft-mint bg-soft-mint/20'
                        : 'border-light-coral bg-light-coral/20'
                      : 'border-border bg-background hover:border-primary/50'
                  }`}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.03 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: index * 0.2 } 
                  }}
                  onClick={() => setSelectedAnswer(option)}
                  disabled={showFeedback}
                >
                  <div className="flex flex-col items-center">
                    <motion.div 
                      whileHover={{ rotate: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {option === 'True' ? (
                        <Check className="w-8 h-8 mb-2 text-soft-mint" />
                      ) : (
                        <X className="w-8 h-8 mb-2 text-light-coral" />
                      )}
                    </motion.div>
                    <span className={`text-lg ${
                      option === 'True' ? 'text-soft-mint' : 'text-light-coral'
                    }`}>{option}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );
        
      default:
        return <div>Unknown question type</div>;
    }
  };
  
  // Render answer submission button
  const renderActionButton = () => {
    if (showFeedback) {
      return (
        <motion.button
          className="w-full bg-gradient-playful text-white py-4 rounded-xl text-lg font-bold shadow-playful transition-all"
          whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleNextQuestion}
        >
          {isLastQuestion ? 'See Results' : 'Next Question'}
          <ChevronRight className="inline ml-2 h-5 w-5" />
        </motion.button>
      );
    }
    
    let isDisabled = false;
    
    // Determine if submit button should be disabled
    switch (currentQuestion?.type) {
      case 'single-answer-multiple-choice':
      case 'true-false':
        isDisabled = !selectedAnswer;
        break;
      case 'multiple-answer-multiple-choice':
        isDisabled = selectedAnswers.length === 0;
        break;
      case 'slider':
        isDisabled = false; // Slider always has a value
        break;
      case 'single-answer-drag-drop':
      case 'multiple-answer-drag-drop':
        isDisabled = Object.values(dragItems).some(value => value === null);
        break;
    }
    
    return (
      <motion.button
        className={`w-full py-4 rounded-xl text-lg font-bold shadow-playful transition-all ${
          isDisabled
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-primary text-white hover:shadow-playful-hover'
        }`}
        whileHover={isDisabled ? {} : { scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}
        whileTap={isDisabled ? {} : { scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={handleSubmitAnswer}
        disabled={isDisabled}
      >
        Submit Answer
      </motion.button>
    );
  };
  
  // Render feedback after answering
  const renderFeedback = () => {
    if (!showFeedback || !currentQuestion) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`rounded-xl p-6 ${
          isCorrect ? 'bg-soft-mint/20' : 'bg-light-coral/20'
        }`}
      >
        <div className="flex items-center mb-4">
          {isCorrect ? (
            <>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 10 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500,
                  damping: 15
                }}
                className="w-10 h-10 rounded-full bg-soft-mint/30 flex items-center justify-center mr-3"
              >
                <Check className="text-soft-mint w-6 h-6" />
              </motion.div>
              <motion.h3
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold"
              >
                Correct!
              </motion.h3>
            </>
          ) : (
            <>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: -10 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500,
                  damping: 15
                }}
                className="w-10 h-10 rounded-full bg-light-coral/30 flex items-center justify-center mr-3"
              >
                <X className="text-light-coral w-6 h-6" />
              </motion.div>
              <motion.h3
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold"
              >
                Not quite right
              </motion.h3>
            </>
          )}
        </div>

        {!isCorrect && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-4"
          >
            <h4 className="font-medium text-foreground mb-1">Correct answer:</h4>
            <p className="text-primary font-medium">
              {Array.isArray(currentQuestion.correctAnswer) 
                ? currentQuestion.correctAnswer.join(', ')
                : typeof currentQuestion.correctAnswer === 'object'
                  ? JSON.stringify(currentQuestion.correctAnswer)
                  : String(currentQuestion.correctAnswer)
              }
            </p>
          </motion.div>
        )}
        
        {isCorrect && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="bg-soft-mint/10 rounded-lg p-3 mb-4 inline-block"
          >
            <span className="text-soft-mint font-medium flex items-center">
              <Award className="w-4 h-4 mr-2" />
              +{currentQuestion.points} points
            </span>
          </motion.div>
        )}
        
        {currentQuestion.explanation && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-2"
          >
            <h4 className="font-medium text-foreground mb-1 flex items-center">
              <HelpCircle className="w-4 h-4 mr-1" /> Explanation:
            </h4>
            <p className="text-foreground/80">{currentQuestion.explanation}</p>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header with progress bar */}
      <div className="bg-background sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="text-foreground/70 hover:text-foreground p-2 -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <h1 className="text-foreground font-medium">{game.title}</h1>
              <p className="text-foreground/60 text-sm">{game.churchName}</p>
            </div>
            
            <div className="text-foreground font-medium">
              {currentQuestionIndex + 1}/{questions.length}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-soft-mint"
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-none shadow-playful">
              <div className="px-5 py-6 md:p-8">
                {/* Question difficulty badge */}
                {currentQuestion?.difficulty && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                    className={`mb-4 inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      currentQuestion.difficulty === 'easy' 
                        ? 'bg-soft-mint/20 text-soft-mint'
                        : currentQuestion.difficulty === 'medium'
                          ? 'bg-lemon-yellow/20 text-deep-navy'
                          : 'bg-light-coral/20 text-light-coral'
                    }`}
                  >
                    <span className="flex items-center">
                      {currentQuestion.difficulty === 'easy' && <Star className="w-3 h-3 mr-1" />}
                      {currentQuestion.difficulty === 'medium' && <Star className="w-3 h-3 mr-1" />}
                      {currentQuestion.difficulty === 'hard' && <Star className="w-3 h-3 mr-1" />}
                      {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
                    </span>
                  </motion.div>
                )}
                
                {/* Question content */}
                {renderQuestion()}
              </div>
            </Card>
            
            {/* Feedback section */}
            {showFeedback && (
              <div className="mt-6">
                {renderFeedback()}
              </div>
            )}
            
            {/* Action button */}
            <div className="mt-6">
              {renderActionButton()}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Points celebration animation */}
      {showPointCelebration && <PointCelebration points={earnedPoints} />}
      
      {/* Add CSS for drop highlight animation */}
      <style jsx global>{`
        .drop-highlight {
          animation: pulse-border 0.3s ease;
        }
        
        @keyframes pulse-border {
          0% { box-shadow: 0 0 0 0 rgba(168, 139, 254, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(168, 139, 254, 0); }
          100% { box-shadow: 0 0 0 0 rgba(168, 139, 254, 0); }
        }
        
        .pulse {
          animation: pulse-bg 0.3s ease;
        }
        
        @keyframes pulse-bg {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
} 