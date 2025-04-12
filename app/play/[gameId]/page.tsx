"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Check, X, ChevronRight, HelpCircle, ArrowLeft, Star, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter, 
  useSensor,
  useSensors,
  PointerSensor,
  useDraggable,
  useDroppable,
  DragEndEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// Types for our question data
type QuestionType = 'single-answer-multiple-choice' | 'multiple-answer-multiple-choice' | 'slider' | 'single-answer-drag-drop' | 'multiple-answer-drag-drop' | 'true-false' | 'single-match-draggable' | 'multiple-match-draggable' | 'multiple-match-true-false-draggable' | 'fill-in-the-blanks-draggable';

interface VerseBookMapping {
  [verse: string]: string;
}

// New interfaces for the draggable question types
interface SingleMatchDraggableAnswer {
  type: 'single-match-draggable';
  draggableItem: string;
  options: string[];
  correctOption: string;
}

interface MultipleMatchDraggableAnswer {
  type: 'multiple-match-draggable';
  draggableItems: string[];
  dropZones: string[];
  correctMapping: { [draggableItem: string]: string };
}

interface MultipleMatchTrueFalseDraggableAnswer {
  type: 'multiple-match-true-false-draggable';
  statements: string[];
  correctMapping: { [statement: string]: boolean };
}

interface FillInTheBlanksDraggableAnswer {
  type: 'fill-in-the-blanks-draggable';
  sentenceTemplate: string;
  blanks: Array<{
    id: string;
    correctOption: string;
  }>;
  options: string[];
}

type Question = {
  id: string;
  type: QuestionType;
  question: string;
  correctAnswer: string | string[] | number | VerseBookMapping | SingleMatchDraggableAnswer | MultipleMatchDraggableAnswer | MultipleMatchTrueFalseDraggableAnswer | FillInTheBlanksDraggableAnswer;
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
  userAnswer: string | string[] | number | Record<string, string> | any;
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

// Draggable component using dnd-kit
const DraggableItem = ({ 
  id, 
  index,
  disabled = false,
  children
}: { 
  id: string;
  index: number;
  disabled?: boolean;
  children: React.ReactNode;
}) => {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id,
    disabled
  });
  
  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    zIndex: 10,
    touchAction: 'none',
  } : {
    touchAction: 'none',
  };
  
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className="p-3 rounded-xl bg-lemon-yellow/20 text-foreground font-medium text-center cursor-grab touch-none"
      whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: { delay: 0.3 + index * 0.1 } 
      }}
      {...listeners}
      {...attributes}
    >
      {children}
    </motion.div>
  );
};

// Droppable component using dnd-kit
const DroppableArea = ({
  id,
  isActive,
  verse,
  matchedOption,
  index,
}: {
  id: string;
  isActive: boolean;
  verse: string;
  matchedOption: string | null;
  index: number;
}) => {
  const {isOver, setNodeRef} = useDroppable({
    id
  });
  
  return (
    <motion.div 
      ref={setNodeRef}
      className={`p-4 rounded-xl border-2 transition-all ${
        matchedOption ? 'border-primary bg-primary/10' : 
        isOver ? 'border-primary/70 bg-primary/5' : 'border-border bg-background'
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
        {matchedOption && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-primary/20 px-3 py-1 rounded-lg text-primary font-medium"
          >
            {matchedOption}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Helper function to format correct answers for display
const formatCorrectAnswer = (questionType: QuestionType, correctAnswer: any): string => {
  switch (questionType) {
    case 'single-answer-multiple-choice':
    case 'true-false':
      return String(correctAnswer);
      
    case 'multiple-answer-multiple-choice':
      return Array.isArray(correctAnswer) 
        ? correctAnswer.join(', ')
        : String(correctAnswer);
        
    case 'slider':
      return String(correctAnswer);
      
    case 'single-answer-drag-drop':
    case 'multiple-answer-drag-drop':
      if (typeof correctAnswer === 'object' && !Array.isArray(correctAnswer)) {
        return Object.entries(correctAnswer)
          .map(([key, value]) => `"${key}" → ${value}`)
          .join('\n');
      }
      return String(correctAnswer);

    case 'single-match-draggable':
      const singleMatch = correctAnswer as SingleMatchDraggableAnswer;
      return `"${singleMatch.draggableItem}" should be matched with "${singleMatch.correctOption}"`;
      
    case 'multiple-match-draggable':
      const multipleMatch = correctAnswer as MultipleMatchDraggableAnswer;
      return Object.entries(multipleMatch.correctMapping)
        .map(([item, zone]) => `"${item}" → ${zone}`)
        .join('\n');
        
    case 'multiple-match-true-false-draggable':
      const trueFalse = correctAnswer as MultipleMatchTrueFalseDraggableAnswer;
      return Object.entries(trueFalse.correctMapping)
        .map(([statement, isTrue]) => `"${statement}" is ${isTrue ? 'True' : 'False'}`)
        .join('\n');
        
    case 'fill-in-the-blanks-draggable':
      const fillBlanks = correctAnswer as FillInTheBlanksDraggableAnswer;
      return fillBlanks.blanks
        .map(blank => `${blank.id}: "${blank.correctOption}"`)
        .join('\n');
        
    default:
      return String(correctAnswer);
  }
};

export default function PlayGame({ params }: { params: any }) {
  const router = useRouter();
  const { gameId } = params;
  
  // Game state
  const [game, setGame] = useState<Game | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userGame, setUserGame] = useState<UserGame>(initUserGame(gameId));
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  // New state for the new question types
  const [singleMatchAnswer, setSingleMatchAnswer] = useState<string | null>(null);
  const [multipleMatchAnswers, setMultipleMatchAnswers] = useState<{[item: string]: string | null}>({});
  const [trueFalseAnswers, setTrueFalseAnswers] = useState<{[statement: string]: boolean | null}>({});
  const [blankAnswers, setBlankAnswers] = useState<{[blankId: string]: string | null}>({});
  
  // Current question
  const currentQuestion = questions[currentQuestionIndex];
  
  // Configure sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  // Fetch game data
  useEffect(() => {
    async function fetchGameData() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/games/details?gameId=${gameId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch game data');
        }
        
        const data = await response.json();
        setGame(data.game);
        setQuestions(data.questions);
      } catch (error) {
        console.error('Error fetching game data:', error);
        toast.error('Failed to load game. Please try again.');
      } finally {
        // Slight delay to ensure loading screen shows properly
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    }
    
    fetchGameData();
  }, [gameId]);
  
  // Setup drag items - MOVED THIS USEEFFECT BEFORE THE CONDITIONAL RETURN
  useEffect(() => {
    if (!currentQuestion) return;
    
    if (currentQuestion.type.includes('drag-drop')) {
      const items: {[key: string]: string | null} = {};
      
      if (typeof currentQuestion.correctAnswer === 'object' && !Array.isArray(currentQuestion.correctAnswer)) {
        Object.keys(currentQuestion.correctAnswer as VerseBookMapping).forEach(key => {
          items[key] = null;
        });
      }
      
      setDragItems(items);
    }
    
    // Initialize state for new question types
    if (currentQuestion.type === 'single-match-draggable') {
      setSingleMatchAnswer(null);
    } else if (currentQuestion.type === 'multiple-match-draggable') {
      const answer = currentQuestion.correctAnswer as MultipleMatchDraggableAnswer;
      const newMatchAnswers: {[item: string]: string | null} = {};
      answer.draggableItems.forEach(item => {
        newMatchAnswers[item] = null;
      });
      setMultipleMatchAnswers(newMatchAnswers);
    } else if (currentQuestion.type === 'multiple-match-true-false-draggable') {
      const answer = currentQuestion.correctAnswer as MultipleMatchTrueFalseDraggableAnswer;
      const newTrueFalseAnswers: {[statement: string]: boolean | null} = {};
      answer.statements.forEach(statement => {
        newTrueFalseAnswers[statement] = null;
      });
      setTrueFalseAnswers(newTrueFalseAnswers);
    } else if (currentQuestion.type === 'fill-in-the-blanks-draggable') {
      const answer = currentQuestion.correctAnswer as FillInTheBlanksDraggableAnswer;
      const newBlankAnswers: {[blankId: string]: string | null} = {};
      answer.blanks.forEach(blank => {
        newBlankAnswers[blank.id] = null;
      });
      setBlankAnswers(newBlankAnswers);
    }
  }, [currentQuestion]);
  
  // Progress tracking
  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  
  // Check if question has been answered
  const isQuestionAnswered = userGame.answers.some(
    answer => answer.questionId === currentQuestion?.id
  );

  // User is at the end of questions
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // If loading or no data, return null (loading component will be shown automatically)
  if (isLoading || !game || !currentQuestion) return null;
  
  // Process and validate user's answer
  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;
    
    let answer: string | string[] | number | VerseBookMapping | any;
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
        
      case 'single-match-draggable':
        answer = singleMatchAnswer;
        const singleMatchCorrectAnswer = currentQuestion.correctAnswer as SingleMatchDraggableAnswer;
        correct = answer === singleMatchCorrectAnswer.correctOption;
        break;
        
      case 'multiple-match-draggable':
        answer = {...multipleMatchAnswers};
        const multipleMatchCorrectAnswer = currentQuestion.correctAnswer as MultipleMatchDraggableAnswer;
        
        // Check if all mappings are correct
        correct = Object.entries(multipleMatchAnswers).every(
          ([item, zone]) => zone === multipleMatchCorrectAnswer.correctMapping[item]
        );
        break;
        
      case 'multiple-match-true-false-draggable':
        answer = {...trueFalseAnswers};
        const trueFalseCorrectAnswer = currentQuestion.correctAnswer as MultipleMatchTrueFalseDraggableAnswer;
        
        // Check if all statements are correctly classified
        correct = Object.entries(trueFalseAnswers).every(
          ([statement, isTrue]) => isTrue === trueFalseCorrectAnswer.correctMapping[statement]
        );
        break;
        
      case 'fill-in-the-blanks-draggable':
        answer = {...blankAnswers};
        const fillBlanksCorrectAnswer = currentQuestion.correctAnswer as FillInTheBlanksDraggableAnswer;
        
        // Check if all blanks have the correct words
        correct = fillBlanksCorrectAnswer.blanks.every(
          blank => blankAnswers[blank.id] === blank.correctOption
        );
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
  
  // Handle drag end for dnd-kit
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over) {
      if (currentQuestion?.type.includes('drag-drop')) {
        // Extract the verse from the dropzone ID
        const verse = over.id.toString().replace('dropzone-', '');
        
        // Extract the option from the draggable ID
        const option = active.id.toString().replace('draggable-', '');
        
        // Update dragItems state
        setDragItems(prev => ({
          ...prev,
          [verse]: option
        }));
      } else if (currentQuestion?.type === 'single-match-draggable') {
        // Extract the option from the dropzone ID
        const option = over.id.toString().replace('dropzone-', '');
        
        // Set the single match answer
        setSingleMatchAnswer(option);
      } else if (currentQuestion?.type === 'multiple-match-draggable') {
        // Extract the item from the draggable ID
        const item = active.id.toString().replace('draggable-', '');
        
        // Extract the zone from the dropzone ID
        const zone = over.id.toString().replace('dropzone-', '');
        
        // Update multipleMatchAnswers state
        setMultipleMatchAnswers(prev => ({
          ...prev,
          [item]: zone
        }));
      } else if (currentQuestion?.type === 'multiple-match-true-false-draggable') {
        // Extract the statement from the draggable ID
        const statement = active.id.toString().replace('draggable-', '');
        
        // Extract whether it's true or false from the dropzone ID
        const isTrueZone = over.id.toString().includes('true');
        
        // Update trueFalseAnswers state
        setTrueFalseAnswers(prev => ({
          ...prev,
          [statement]: isTrueZone
        }));
      } else if (currentQuestion?.type === 'fill-in-the-blanks-draggable') {
        // Extract the word from the draggable ID
        const word = active.id.toString().replace('draggable-', '');
        
        // Extract the blank ID from the dropzone ID
        const blankId = over.id.toString().replace('dropzone-', '');
        
        // Update blankAnswers state
        setBlankAnswers(prev => ({
          ...prev,
          [blankId]: word
        }));
      }
      
      // Show visual feedback with toast
      toast.success(
        <div className="flex items-center">
          <div className="mr-2">
            <Check className="h-5 w-5 text-soft-mint" />
          </div>
          <span>Matched!</span>
        </div>,
        {
          position: "bottom-center",
          duration: 1000,
          className: "bg-gradient-to-r from-primary/10 to-soft-mint/10"
        }
      );
    }
  };
  
  // Move to next question or finish game
  const handleNextQuestion = () => {
    setShowFeedback(false);
    
    // Reset UI state for next question
    setSelectedAnswer(null);
    setSelectedAnswers([]);
    setSliderValue(0);
    setDragItems({});
    setSingleMatchAnswer(null);
    setMultipleMatchAnswers({});
    setTrueFalseAnswers({});
    setBlankAnswers({});
    
    if (isLastQuestion) {
      // Complete the game
      const completedUserGame = {
        ...userGame,
        status: 'completed' as const,
        completedAt: new Date(),
        timeSpentSeconds: Math.floor((new Date().getTime() - userGame.startedAt.getTime()) / 1000)
      };
      
      setUserGame(completedUserGame);
      
      // Submit the game results to the API
      submitGameResults(completedUserGame);
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  // Submit game results to API
  const submitGameResults = async (completedGame: UserGame) => {
    try {
      // Show loading toast
      toast.loading("Submitting your results...", {
        id: "submit-results",
      });
      
      // Format the answers data for the API
      const formattedAnswers = completedGame.answers.map(answer => ({
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
      }));
      
      // Make API request
      const response = await fetch('/api/games/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          answers: formattedAnswers,
          timeSpentSeconds: completedGame.timeSpentSeconds
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit game results');
      }
      
      const data = await response.json();
      
      // Success toast
      toast.success("Game completed! Viewing your results...", {
        id: "submit-results",
        duration: 2000,
      });
      
      // Navigate to results page
      setTimeout(() => {
        router.push(`/results/${data.userGameId || 'latest'}?gameId=${gameId}`);
      }, 500);
    } catch (error) {
      console.error('Error submitting game results:', error);
      
      // Error toast
      toast.error("Couldn't save your results. Try again later.", {
        id: "submit-results",
        duration: 3000,
      });
      
      // Navigate to home after error
      setTimeout(() => {
        router.push('/home');
      }, 2000);
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
  
  // Add handlers to remove dragged items
  const handleRemoveSingleMatch = () => {
    setSingleMatchAnswer(null);
  };

  const handleRemoveMultipleMatchItem = (item: string) => {
    setMultipleMatchAnswers(prev => ({
      ...prev,
      [item]: null
    }));
  };

  const handleRemoveTrueFalseItem = (statement: string) => {
    setTrueFalseAnswers(prev => ({
      ...prev,
      [statement]: null
    }));
  };

  const handleRemoveBlankWord = (blankId: string) => {
    setBlankAnswers(prev => ({
      ...prev,
      [blankId]: null
    }));
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
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-6">
              <h2 className="text-xl md:text-2xl font-fredoka text-foreground mb-6">{currentQuestion.question}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-foreground/80">Verses</h3>
                  {verses.map((verse, index) => (
                    <DroppableArea
                      key={index}
                      id={`dropzone-${verse}`}
                      isActive={true}
                      verse={verse}
                      matchedOption={dragItems[verse]}
                      index={index}
                    />
                  ))}
                </div>
                
                <div className="space-y-3 relative min-h-[200px]">
                  <h3 className="text-lg font-medium text-foreground/80">Drag the correct book</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {options.map((option, index) => {
                      // Skip options that are already matched
                      if (Object.values(dragItems).includes(option)) return null;
                      
                      return (
                        <DraggableItem
                          key={index}
                          id={`draggable-${option}`}
                          index={index}
                          disabled={showFeedback}
                        >
                          {option}
                        </DraggableItem>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </DndContext>
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
        
      case 'single-match-draggable':
        const singleMatchData = currentQuestion.correctAnswer as SingleMatchDraggableAnswer;
        return (
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-6">
              <h2 className="text-xl md:text-2xl font-fredoka text-foreground mb-6">{currentQuestion.question}</h2>
              <div className="grid grid-cols-1 gap-6">
                <div className="flex justify-center mb-4">
                  {singleMatchAnswer === null ? (
                    <DraggableItem
                      id={`draggable-${singleMatchData.draggableItem}`}
                      index={0}
                      disabled={showFeedback}
                    >
                      {singleMatchData.draggableItem}
                    </DraggableItem>
                  ) : (
                    <div className="p-3 text-center">{singleMatchData.draggableItem}</div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {singleMatchData.options.map((option, index) => (
                    <div
                      key={index}
                      className={`relative ${singleMatchAnswer === option ? 'opacity-100' : 'opacity-100'}`}
                    >
                      <div 
                        className={`p-4 rounded-xl border-2 transition-all ${
                          singleMatchAnswer === option 
                            ? 'border-primary bg-primary/10 cursor-pointer' 
                            : 'border-border bg-background'
                        }`}
                        onClick={() => {
                          if (singleMatchAnswer === option && !showFeedback) {
                            handleRemoveSingleMatch();
                          }
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <p className="text-foreground">{option}</p>
                          {singleMatchAnswer === option && (
                            <motion.div 
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="flex items-center"
                            >
                              <span className="bg-primary/20 px-3 py-1 rounded-lg text-primary font-medium mr-2">
                                {singleMatchData.draggableItem}
                              </span>
                              {!showFeedback && (
                                <X className="w-4 h-4 text-foreground/60 hover:text-foreground" />
                              )}
                            </motion.div>
                          )}
                        </div>
                      </div>
                      {singleMatchAnswer !== option && (
                        <div className="absolute inset-0 pointer-events-none">
                          <DroppableArea
                            id={`dropzone-${option}`}
                            isActive={!showFeedback && singleMatchAnswer === null}
                            verse={option}
                            matchedOption={null}
                            index={index}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DndContext>
        );
      
      case 'multiple-match-draggable':
        const multipleMatchData = currentQuestion.correctAnswer as MultipleMatchDraggableAnswer;
        return (
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-6">
              <h2 className="text-xl md:text-2xl font-fredoka text-foreground mb-6">{currentQuestion.question}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-foreground/80">Items to Classify</h3>
                  <div className="space-y-2">
                    {multipleMatchData.draggableItems.map((item, index) => (
                      multipleMatchAnswers[item] === null && (
                        <DraggableItem
                          key={index}
                          id={`draggable-${item}`}
                          index={index}
                          disabled={showFeedback}
                        >
                          {item}
                        </DraggableItem>
                      )
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-foreground/80">Categories</h3>
                  <div className="space-y-3">
                    {multipleMatchData.dropZones.map((zone, index) => (
                      <div key={index} className="relative">
                        <motion.div
                          className="p-4 rounded-xl border-2 border-border bg-background"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ 
                            opacity: 1, 
                            x: 0,
                            transition: { delay: index * 0.1 } 
                          }}
                        >
                          <div className="flex flex-col">
                            <div className="font-medium mb-2">{zone}</div>
                            <div className="min-h-[50px]">
                              {Object.entries(multipleMatchAnswers).map(([item, mappedZone], itemIndex) => (
                                mappedZone === zone && (
                                  <motion.div
                                    key={itemIndex}
                                    className="p-2 mb-1 rounded-lg bg-primary/10 text-primary flex justify-between items-center"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    onClick={() => {
                                      if (!showFeedback) {
                                        handleRemoveMultipleMatchItem(item);
                                      }
                                    }}
                                  >
                                    <span>{item}</span>
                                    {!showFeedback && (
                                      <X className="w-4 h-4 text-foreground/60 hover:text-foreground cursor-pointer" />
                                    )}
                                  </motion.div>
                                )
                              ))}
                            </div>
                          </div>
                        </motion.div>
                        <div className="absolute inset-0 pointer-events-none">
                          <DroppableArea
                            id={`dropzone-${zone}`}
                            isActive={!showFeedback}
                            verse={zone}
                            matchedOption={null}
                            index={index}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </DndContext>
        );
      
      case 'multiple-match-true-false-draggable':
        const trueFalseData = currentQuestion.correctAnswer as MultipleMatchTrueFalseDraggableAnswer;
        return (
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-6">
              <h2 className="text-xl md:text-2xl font-fredoka text-foreground mb-6">{currentQuestion.question}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-foreground/80">Statements</h3>
                  <div className="space-y-2">
                    {trueFalseData.statements.map((statement, index) => (
                      trueFalseAnswers[statement] === null && (
                        <DraggableItem
                          key={index}
                          id={`draggable-${statement}`}
                          index={index}
                          disabled={showFeedback}
                        >
                          {statement}
                        </DraggableItem>
                      )
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <motion.div
                      className="p-4 rounded-xl border-2 border-soft-mint bg-soft-mint/10"
                      whileHover={{ scale: 1.01 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center mb-2">
                        <Check className="w-5 h-5 text-soft-mint mr-2" />
                        <h3 className="font-medium text-soft-mint">True</h3>
                      </div>
                      <div className="min-h-[80px]">
                        {Object.entries(trueFalseAnswers).map(([statement, isTrue], idx) => (
                          isTrue === true && (
                            <motion.div
                              key={idx}
                              className="p-2 mb-1 rounded-lg bg-soft-mint/10 text-soft-mint flex justify-between items-center"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              onClick={() => {
                                if (!showFeedback) {
                                  handleRemoveTrueFalseItem(statement);
                                }
                              }}
                            >
                              <span>{statement}</span>
                              {!showFeedback && (
                                <X className="w-4 h-4 text-soft-mint/60 hover:text-soft-mint cursor-pointer" />
                              )}
                            </motion.div>
                          )
                        ))}
                      </div>
                    </motion.div>
                    <div className="absolute inset-0 pointer-events-none">
                      <DroppableArea
                        id={`dropzone-true`}
                        isActive={!showFeedback}
                        verse="True"
                        matchedOption={null}
                        index={0}
                      />
                    </div>
                  </div>
                  
                  <div className="relative">
                    <motion.div
                      className="p-4 rounded-xl border-2 border-light-coral bg-light-coral/10"
                      whileHover={{ scale: 1.01 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                    >
                      <div className="flex items-center mb-2">
                        <X className="w-5 h-5 text-light-coral mr-2" />
                        <h3 className="font-medium text-light-coral">False</h3>
                      </div>
                      <div className="min-h-[80px]">
                        {Object.entries(trueFalseAnswers).map(([statement, isTrue], idx) => (
                          isTrue === false && (
                            <motion.div
                              key={idx}
                              className="p-2 mb-1 rounded-lg bg-light-coral/10 text-light-coral flex justify-between items-center"
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              onClick={() => {
                                if (!showFeedback) {
                                  handleRemoveTrueFalseItem(statement);
                                }
                              }}
                            >
                              <span>{statement}</span>
                              {!showFeedback && (
                                <X className="w-4 h-4 text-light-coral/60 hover:text-light-coral cursor-pointer" />
                              )}
                            </motion.div>
                          )
                        ))}
                      </div>
                    </motion.div>
                    <div className="absolute inset-0 pointer-events-none">
                      <DroppableArea
                        id={`dropzone-false`}
                        isActive={!showFeedback}
                        verse="False"
                        matchedOption={null}
                        index={1}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DndContext>
        );
      
      case 'fill-in-the-blanks-draggable':
        const fillBlanksData = currentQuestion.correctAnswer as FillInTheBlanksDraggableAnswer;
        
        // Process the sentence template to render with blanks
        const parts = fillBlanksData.sentenceTemplate.split(/(\{blank\d+\})/g);
        
        return (
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-6">
              <h2 className="text-xl md:text-2xl font-fredoka text-foreground mb-6">{currentQuestion.question}</h2>
              
              <div className="p-4 bg-background rounded-xl border-2 border-border">
                <div className="text-lg leading-relaxed flex flex-wrap items-center">
                  {parts.map((part, index) => {
                    const blankMatch = part.match(/\{(blank\d+)\}/);
                    
                    if (blankMatch) {
                      const blankId = blankMatch[1];
                      const filledWord = blankAnswers[blankId];
                      
                      return (
                        <div key={index} className="inline-block mx-1 my-1">
                          {filledWord ? (
                            <motion.div
                              className="px-3 py-1 bg-primary/10 text-primary font-medium rounded-lg flex items-center"
                              initial={{ scale: 0.9 }}
                              animate={{ scale: 1 }}
                              onClick={() => {
                                if (!showFeedback) {
                                  handleRemoveBlankWord(blankId);
                                }
                              }}
                            >
                              <span>{filledWord}</span>
                              {!showFeedback && (
                                <X className="w-4 h-4 ml-2 text-primary/60 hover:text-primary cursor-pointer" />
                              )}
                            </motion.div>
                          ) : (
                            <div className="relative">
                              <div className="w-24 h-8 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                                <span className="text-foreground/30">_______</span>
                              </div>
                              <div className="absolute inset-0">
                                <DroppableArea
                                  id={`dropzone-${blankId}`}
                                  isActive={!showFeedback}
                                  verse=""
                                  matchedOption={null}
                                  index={index}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                    
                    return <span key={index}>{part}</span>;
                  })}
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-foreground/80 mb-3">Available Words</h3>
                <div className="flex flex-wrap gap-2">
                  {fillBlanksData.options.map((word, index) => {
                    // Skip words that are already placed in blanks
                    if (Object.values(blankAnswers).includes(word)) return null;
                    
                    return (
                      <DraggableItem
                        key={index}
                        id={`draggable-${word}`}
                        index={index}
                        disabled={showFeedback}
                      >
                        {word}
                      </DraggableItem>
                    );
                  })}
                </div>
              </div>
            </div>
          </DndContext>
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
      case 'single-match-draggable':
        isDisabled = singleMatchAnswer === null;
        break;
      case 'multiple-match-draggable':
        isDisabled = Object.keys(multipleMatchAnswers).length === 0 || Object.values(multipleMatchAnswers).some(value => value === null);
        break;
      case 'multiple-match-true-false-draggable':
        isDisabled = Object.keys(trueFalseAnswers).length === 0 || Object.values(trueFalseAnswers).some(value => value === null);
        break;
      case 'fill-in-the-blanks-draggable':
        isDisabled = Object.keys(blankAnswers).length === 0 || Object.values(blankAnswers).some(value => value === null);
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
            <pre className="text-primary font-medium whitespace-pre-line">
              {formatCorrectAnswer(currentQuestion.type, currentQuestion.correctAnswer)}
            </pre>
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