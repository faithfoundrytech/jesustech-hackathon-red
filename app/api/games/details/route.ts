import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Game, { IGame } from '@/models/Game';
import Question, { IQuestion } from '@/models/Question';
import Church from '@/models/Church';
import { getAuthenticatedUser } from '@/lib/auth';
import { logger } from '@/utils/logger';
import mongoose from 'mongoose';

// Helper for creating consistent dummy IDs
const createDummyId = (id: string) => {
  try {
    return new mongoose.Types.ObjectId(id.padStart(24, '0'));
  } catch (e) {
    return new mongoose.Types.ObjectId();
  }
};

// Dummy questions for testing
const getDummyQuestions = (gameId: string) => [
  {
    _id: createDummyId("question1"),
    type: 'single-answer-multiple-choice',
    question: 'Which verse states "For God so loved the world"?',
    correctAnswer: 'John 3:16',
    fakeAnswers: ['Matthew 5:1', 'Romans 8:28', 'Genesis 1:1'],
    gameId: createDummyId(gameId),
    points: 10,
    difficulty: 'easy',
    explanation: 'John 3:16 is one of the most well-known verses in the Bible, often called "the Gospel in a nutshell".',
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: createDummyId("question2"),
    type: 'multiple-answer-multiple-choice',
    question: 'Which of the following are Fruits of the Spirit mentioned in Galatians 5:22-23?',
    correctAnswer: ['Love', 'Joy', 'Peace', 'Patience'],
    fakeAnswers: ['Pride', 'Anger', 'Wealth', 'Success'],
    gameId: createDummyId(gameId),
    points: 20,
    difficulty: 'medium',
    explanation: 'The Fruits of the Spirit are love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control.',
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: createDummyId("question3"),
    type: 'slider',
    question: 'How many disciples did Jesus have?',
    correctAnswer: 12,
    fakeAnswers: [],
    gameId: createDummyId(gameId),
    points: 15,
    difficulty: 'easy',
    explanation: 'Jesus had 12 disciples who followed him closely and became his apostles.',
    order: 3,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: createDummyId("question4"),
    type: 'single-answer-drag-drop',
    question: 'Match the verse with the correct book of the Bible:',
    correctAnswer: {
      'In the beginning God created the heavens and the earth': 'Genesis',
      'The Lord is my shepherd; I shall not want': 'Psalms',
      'For God so loved the world': 'John'
    },
    fakeAnswers: ['Matthew', 'Luke', 'Revelation', 'Exodus'],
    gameId: createDummyId(gameId),
    points: 30,
    difficulty: 'hard',
    explanation: 'These are some of the most well-known verses from their respective books.',
    order: 4,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: createDummyId("question5"),
    type: 'true-false',
    question: 'Moses led the Israelites across the Red Sea.',
    correctAnswer: 'True',
    fakeAnswers: ['False'],
    gameId: createDummyId(gameId),
    points: 10,
    difficulty: 'easy',
    explanation: 'Moses did lead the Israelites across the Red Sea as recorded in the book of Exodus.',
    order: 5,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: createDummyId("question6"),
    type: 'single-match-draggable',
    question: 'Drag the Bible verse to the correct theme:',
    correctAnswer: {
      type: 'single-match-draggable',
      draggableItem: 'The Lord is my shepherd; I shall not want.',
      options: ['Protection', 'Guidance', 'Judgment', 'Creation'],
      correctOption: 'Guidance'
    },
    fakeAnswers: [],
    gameId: createDummyId(gameId),
    points: 15,
    difficulty: 'medium',
    explanation: 'This verse from Psalm 23:1 is about God\'s guidance in our lives.',
    order: 6,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export async function GET(req: NextRequest) {
  try {
    // Get gameId from the query string
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    // Authenticate the user
    const user = await getAuthenticatedUser();
    
    await dbConnect();

    // Try to find the game
    let game = await Game.findById(gameId).lean();
    let questions = await Question.find({ gameId }).sort({ order: 1 }).lean();
    let church;

    // If no game found, return dummy data
    if (!game) {
      logger.info('api/games/details', 'Game not found, returning dummy data', { gameId });
      
      const dummyGameId = createDummyId(gameId);
      const dummyChurchId = createDummyId("church1");
      
      // Create a dummy game document
      game = {
        _id: dummyGameId,
        churchId: dummyChurchId,
        creatorId: user._id,
        title: "Faith Foundations Challenge",
        description: "Test your knowledge on the foundations of faith",
        metadata: {
          title: "Faith Foundations Sermon",
          preacher: "Pastor John",
          date: new Date("2023-08-15"),
          mainVerses: ["John 3:16", "Romans 8:28"],
          sermonText: ""
        },
        status: "live",
        pointsAvailable: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0
      } as any;
      
      questions = getDummyQuestions(gameId) as any;
      
      church = {
        _id: dummyChurchId,
        name: "Grace Community Church",
        location: "Seattle, WA",
        description: "A vibrant church focused on community and faith",
        imageUrl: "https://placehold.co/400x200/FFF8F1/2F2F5D?text=Grace+Church",
        creatorId: user._id,
      };
    } else {
      // Get church details
      church = await Church.findById(game.churchId).lean();
      
      // If no questions found but game exists, still return dummy questions
      if (questions.length === 0) {
        logger.info('api/games/details', 'No questions found, returning dummy questions', { gameId });
        questions = getDummyQuestions(gameId) as any;
      }
    }

    // Format response data
    const formattedGame = {
      id: game?._id.toString(),
      title: game?.title,
      description: game?.description || undefined,
      pointsAvailable: questions.reduce((total, q) => total + q.points, 0),
      questionsCount: questions.length,
      churchName: church?.name || "Unknown Church"
    };

    const formattedQuestions = questions.map(q => ({
      id: q._id.toString(),
      type: q.type,
      question: q.question,
      correctAnswer: q.correctAnswer,
      fakeAnswers: q.fakeAnswers,
      points: q.points,
      difficulty: q.difficulty,
      explanation: q.explanation,
      order: q.order
    }));

    // Introduce a delay to simulate processing (in production you would remove this)
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      game: formattedGame,
      questions: formattedQuestions
    });
  } catch (error) {
    console.error('Error fetching game details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game details' },
      { status: 500 }
    );
  }
}
