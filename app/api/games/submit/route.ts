import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Game from '@/models/Game';
import Question from '@/models/Question';
import UserGame, { IUserGame } from '@/models/UserGame';
import Points from '@/models/Points';
import Church from '@/models/Church';
import { getAuthenticatedUser } from '@/lib/auth';
import { logger } from '@/utils/logger';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    // Authenticate the user
    const user = await getAuthenticatedUser();
    
    // Parse request body
    const body = await req.json();
    const { gameId, answers, timeSpentSeconds } = body;
    
    if (!gameId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Invalid request data. gameId and answers array are required.' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Get game and associated church
    const game = await Game.findById(gameId);
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    // Get all questions for this game
    const questions = await Question.find({ gameId }).sort({ order: 1 });
    if (!questions.length) {
      return NextResponse.json({ error: 'No questions found for this game' }, { status: 404 });
    }
    
    // Check if user has already played this game
    let userGame = await UserGame.findOne({ userId: user._id, gameId });
    const isFirstPlay = !userGame;
    
    // Create a map of question IDs for quick lookup
    const questionMap = new Map();
    questions.forEach(q => questionMap.set(q._id.toString(), q));
    
    // Process answers and calculate score
    let totalScore = 0;
    
    const processedAnswers = answers.map(answer => {
      const { questionId, userAnswer } = answer;
      const question = questionMap.get(questionId);
      
      if (!question) {
        return {
          questionId: new mongoose.Types.ObjectId(questionId),
          userAnswer,
          correct: false,
          pointsEarned: 0
        };
      }
      
      // Determine if answer is correct based on question type
      let correct = false;
      
      switch (question.type) {
        case 'single-answer-multiple-choice':
        case 'true-false':
          correct = userAnswer === question.correctAnswer;
          break;
          
        case 'multiple-answer-multiple-choice':
          // For multiple answers, make sure all correct answers are present and no extras
          const targetAnswers = question.correctAnswer as string[];
          correct = targetAnswers.length === userAnswer.length && 
                    targetAnswers.every(a => userAnswer.includes(a));
          break;
          
        case 'slider':
          // For slider, allow small margin of error
          const targetValue = question.correctAnswer as number;
          correct = Math.abs(userAnswer - targetValue) <= 1;
          break;
          
        case 'single-answer-drag-drop':
        case 'multiple-answer-drag-drop':
          // Check mapping is correct
          if (typeof question.correctAnswer === 'object' && !Array.isArray(question.correctAnswer)) {
            const correctMapping = question.correctAnswer as Record<string, string>;
            correct = Object.entries(userAnswer).every(
              ([key, value]) => value === correctMapping[key]
            );
          }
          break;
          
        case 'single-match-draggable':
          const singleMatchAnswer = question.correctAnswer as any;
          correct = userAnswer === singleMatchAnswer.correctOption;
          break;
          
        case 'multiple-match-draggable':
          const multipleMatchAnswer = question.correctAnswer as any;
          correct = Object.entries(userAnswer).every(
            ([item, zone]) => zone === multipleMatchAnswer.correctMapping[item]
          );
          break;
          
        case 'multiple-match-true-false-draggable':
          const trueFalseAnswer = question.correctAnswer as any;
          correct = Object.entries(userAnswer).every(
            ([statement, isTrue]) => isTrue === trueFalseAnswer.correctMapping[statement]
          );
          break;
          
        case 'fill-in-the-blanks-draggable':
          const fillBlanksAnswer = question.correctAnswer as any;
          correct = fillBlanksAnswer.blanks.every(
            (blank: any) => userAnswer[blank.id] === blank.correctOption
          );
          break;
      }
      
      // Calculate points
      const pointsEarned = correct ? question.points : 0;
      totalScore += pointsEarned;
      
      return {
        questionId: new mongoose.Types.ObjectId(questionId),
        userAnswer,
        correct,
        pointsEarned
      };
    });
    
    // Create or update user game record
    if (isFirstPlay) {
      userGame = new UserGame({
        userId: user._id,
        gameId: game._id,
        churchId: game.churchId,
        answers: processedAnswers,
        score: totalScore,
        totalPointsEarned: totalScore,
        status: 'completed',
        firstPlay: true,
        startedAt: new Date(Date.now() - (timeSpentSeconds * 1000)),
        completedAt: new Date(),
        timeSpentSeconds
      });
    } else if (userGame) {
      userGame.answers = processedAnswers;
      userGame.score = totalScore;
      userGame.status = 'completed';
      userGame.completedAt = new Date();
      userGame.timeSpentSeconds = timeSpentSeconds;
      
      // Only add points to total if better than previous attempt
      if (totalScore > userGame.totalPointsEarned) {
        const pointsDifference = totalScore - userGame.totalPointsEarned;
        userGame.totalPointsEarned = totalScore;
        
        // Create a points record for the improvement
        if (pointsDifference > 0) {
          await Points.create({
            userId: user._id,
            amount: pointsDifference,
            transactionType: 'earned',
            source: 'game_completion',
            description: `Improved score on ${game.title}`,
            gameId: game._id,
            churchId: game.churchId
          });
        }
      }
    }
    
    // Only save if userGame exists
    if (userGame) {
      await userGame.save();
    }
    
    // If first play, create a points record
    if (isFirstPlay && userGame) {
      await Points.create({
        userId: user._id,
        amount: totalScore,
        transactionType: 'earned',
        source: 'game_completion',
        description: `Completed ${game.title}`,
        gameId: game._id,
        churchId: game.churchId
      });
      
      // Update user's total points
      await user.updateOne({ $inc: { totalPoints: totalScore } });
    } else if (userGame && totalScore > userGame.totalPointsEarned) {
      // Update user's total points with the difference
      await user.updateOne({ $inc: { totalPoints: totalScore - userGame.totalPointsEarned } });
    }
    
    return NextResponse.json({
      success: true,
      userGameId: userGame?._id.toString(),
      score: totalScore,
      isFirstPlay
    });
    
  } catch (error) {
    console.error('Error submitting game results:', error);
    return NextResponse.json(
      { error: 'Failed to submit game results' },
      { status: 500 }
    );
  }
}
