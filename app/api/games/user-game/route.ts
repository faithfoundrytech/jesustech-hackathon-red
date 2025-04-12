import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Game from '@/models/Game';
import Question from '@/models/Question';
import UserGame from '@/models/UserGame';
import Church from '@/models/Church';
import User from '@/models/User';
import { getAuthenticatedUser } from '@/lib/auth';
import { logger } from '@/utils/logger';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    // Get user game ID from the query string
    const { searchParams } = new URL(req.url);
    const userGameId = searchParams.get('userGameId');
    const gameId = searchParams.get('gameId');
    
    if (!userGameId && !gameId) {
      return NextResponse.json(
        { error: 'Either userGameId or gameId is required' },
        { status: 400 }
      );
    }
    
    // Authenticate the user
    const user = await getAuthenticatedUser();
    
    await dbConnect();
    
    // Find the user game
    let userGame;
    
    if (userGameId) {
      userGame = await UserGame.findById(userGameId);
    } else if (gameId) {
      userGame = await UserGame.findOne({ 
        userId: user._id,
        gameId,
        status: 'completed'
      }).sort({ completedAt: -1 }); // Get the most recent completed game
    }
    
    if (!userGame) {
      return NextResponse.json(
        { error: 'User game not found' },
        { status: 404 }
      );
    }
    
    // Get the game
    const game = await Game.findById(userGame.gameId);
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }
    
    // Get the church
    const church = await Church.findById(userGame.churchId);
    
    // Get the questions
    const questions = await Question.find({ gameId: userGame.gameId }).sort({ order: 1 });
    
    // Create a map of questions for quick lookup
    const questionMap = new Map();
    questions.forEach(q => questionMap.set(q._id.toString(), q));
    
    // Format the question summaries
    const questionSummaries = userGame.answers.map(answer => {
      const question = questionMap.get(answer.questionId.toString());
      
      return {
        id: answer.questionId.toString(),
        question: question?.question || 'Question not found',
        isCorrect: answer.correct,
        pointsEarned: answer.pointsEarned,
        userAnswer: answer.userAnswer,
        correctAnswer: question?.correctAnswer || 'Unknown'
      };
    });
    
    // Calculate score percentage
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const scorePercentage = totalPoints > 0 
      ? Math.round((userGame.score / totalPoints) * 100) 
      : 0;
    
    // Format the response
    const result = {
      id: userGame._id.toString(),
      gameId: game._id.toString(),
      title: game.title,
      churchName: church?.name || 'Unknown Church',
      totalPoints,
      earnedPoints: userGame.score,
      scorePercentage,
      correctAnswers: userGame.answers.filter(a => a.correct).length,
      totalQuestions: questions.length,
      timeSpentSeconds: userGame.timeSpentSeconds || 0,
      completedAt: userGame.completedAt,
      questionSummaries
    };
    
    return NextResponse.json({ result });
    
  } catch (error) {
    console.error('Error fetching user game:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user game' },
      { status: 500 }
    );
  }
}
