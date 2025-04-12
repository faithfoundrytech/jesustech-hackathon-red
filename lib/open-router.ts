import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { QuestionType, Answer } from '@/models/Question';
import { IGame } from '@/models/Game';
import Question from '@/models/Question';
import mongoose from 'mongoose';

// Load the prompt template
const promptTemplate = fs.readFileSync(path.join(process.cwd(), 'lib/prompt.txt'), 'utf-8');

// Define the schema for our structured output
const questionSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: [
          'single-answer-multiple-choice',
          'multiple-answer-multiple-choice',
          'slider',
          'single-answer-drag-drop',
          'multiple-answer-drag-drop',
          'true-false',
          'single-match-draggable',
          'multiple-match-draggable',
          'multiple-match-true-false-draggable',
          'fill-in-the-blanks-draggable'
        ],
        description: 'The type of question to generate'
      },
      question: {
        type: 'string',
        description: 'The actual question text to display to the user'
      },
      correctAnswer: {
        type: 'object',
        description: 'The correct answer data structure, which varies based on the question type'
      },
      fakeAnswers: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Array of incorrect options for choice-based questions'
      },
      points: {
        type: 'integer',
        minimum: 5,
        maximum: 50,
        description: 'Points awarded for correctly answering this question'
      },
      difficulty: {
        type: 'string',
        enum: ['easy', 'medium', 'hard'],
        description: 'The difficulty level of the question'
      },
      explanation: {
        type: 'string',
        description: 'An explanation of why the correct answer is right, providing context and learning'
      }
    },
    required: ['type', 'question', 'correctAnswer', 'fakeAnswers', 'points', 'difficulty', 'explanation'],
    additionalProperties: false
  },
  minItems: 5,
  maxItems: 10,
  description: 'An array of interactive questions for the Play the Word game'
};

// Initialize the OpenAI client with OpenRouter settings
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY as string,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://playtheword.church',
    'X-Title': 'Play the Word',
  },
});

/**
 * Generate interactive questions based on sermon content
 * @param game The game object containing sermon metadata
 * @param sermonContent The full sermon content (text, transcript, etc.)
 * @param instructions Any additional instructions for the AI
 * @returns Array of generated questions
 */
export async function generateQuestions(
  game: IGame, 
  sermonContent: string, 
  instructions?: string
) {
  try {
    console.log('Generating questions for game:', game._id.toString());
    
    // Prepare context for the AI from the game metadata
    const context = {
      title: game.title,
      sermonTitle: game.metadata.title,
      theme: game.metadata.theme || 'Not specified',
      preacher: game.metadata.preacher || 'Not specified',
      mainVerses: game.metadata.mainVerses || [],
      sermonDate: game.metadata.date ? new Date(game.metadata.date).toLocaleDateString() : 'Not specified'
    };
    
    // Create the prompt for the AI
    const prompt = `
${promptTemplate}

SERMON CONTENT:
${sermonContent}

SERMON METADATA:
${JSON.stringify(context, null, 2)}

${instructions ? `ADDITIONAL INSTRUCTIONS:\n${instructions}\n` : ''}

Please generate a set of 5-10 varied, engaging questions based on this sermon content.
`;

    // Make the API call to OpenRouter with structured output
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'PlayTheWordQuestions',
          strict: true,
          schema: questionSchema
        }
      },
      temperature: 0.7,
      max_tokens: 4000
    });

    // Parse the response
    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error('No content returned from the API');
    }
    const questions = JSON.parse(responseContent);
    
    console.log(`Generated ${questions.length} questions successfully`);
    
    return questions;
  } catch (error: any) {
    console.error('Error generating questions:', error);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
}

/**
 * Saves generated questions to the database and updates the game status
 * @param gameId The ID of the game to save questions for
 * @param generatedQuestions The array of generated questions
 * @returns The updated game object and saved questions
 */
export async function saveGeneratedQuestions(
  gameId: string,
  generatedQuestions: any[]
) {
  try {
    // Find the game
    const game = await mongoose.model('Game').findById(gameId);
    if (!game) {
      throw new Error(`Game not found: ${gameId}`);
    }
    
    // Convert to MongoDB ObjectIds
    const gameObjectId = new mongoose.Types.ObjectId(gameId);
    
    // Create question objects
    const questionObjects = generatedQuestions.map((q, index) => ({
      type: q.type,
      question: q.question,
      correctAnswer: q.correctAnswer,
      fakeAnswers: q.fakeAnswers,
      gameId: gameObjectId,
      points: q.points,
      difficulty: q.difficulty,
      explanation: q.explanation,
      order: index + 1
    }));
    
    // Save questions to the database
    const savedQuestions = await Question.insertMany(questionObjects);
    
    // Calculate total points available
    const totalPoints = questionObjects.reduce((sum, q) => sum + q.points, 0);
    
    // Update game status and points
    game.status = 'generated';
    game.pointsAvailable = totalPoints;
    await game.save();
    
    console.log(`Saved ${savedQuestions.length} questions for game ${gameId}`);
    
    return {
      game,
      questions: savedQuestions
    };
  } catch (error: any) {
    console.error('Error saving generated questions:', error);
    throw new Error(`Failed to save questions: ${error.message}`);
  }
}
