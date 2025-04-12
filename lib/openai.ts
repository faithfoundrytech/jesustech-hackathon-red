import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import fs from 'fs';
import path from 'path';
import Question from '@/models/Question';
import { IGame } from '@/models/Game';
import mongoose from 'mongoose';

// Load the prompt template
const promptTemplate = fs.readFileSync(path.join(process.cwd(), 'lib/prompt.txt'), 'utf-8');

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define a simpler schema structure that's more compatible with OpenAI's requirements
// Let's use a discriminated union with a "type" field for correctAnswer

// Define schema for all possible correctAnswer types
const StringAnswer = z.object({
  value: z.string()
});

const NumberAnswer = z.object({
  value: z.number().int()
});

const StringArrayAnswer = z.object({
  value: z.array(z.string())
});

const RecordAnswer = z.object({
  value: z.record(z.string())
});

const SingleMatchDraggableAnswer = z.object({
  type: z.literal('single-match-draggable'),
  draggableItem: z.string(),
  options: z.array(z.string()),
  correctOption: z.string()
});

const MultipleMatchDraggableAnswer = z.object({
  type: z.literal('multiple-match-draggable'),
  draggableItems: z.array(z.string()),
  dropZones: z.array(z.string()),
  correctMapping: z.record(z.string())
});

const MultipleMatchTrueFalseDraggableAnswer = z.object({
  type: z.literal('multiple-match-true-false-draggable'),
  statements: z.array(z.string()),
  correctMapping: z.record(z.boolean())
});

const BlankSchema = z.object({
  id: z.string(),
  correctOption: z.string()
});

const FillInTheBlanksAnswer = z.object({
  type: z.literal('fill-in-the-blanks-draggable'),
  sentenceTemplate: z.string(),
  blanks: z.array(BlankSchema),
  options: z.array(z.string())
});

// Define a schema for a single question
// We'll simplify by using string constants for correctAnswer
const QuestionSchema = z.object({
  type: z.string(),
  question: z.string(),
  correctAnswer: z.any(), // Using any for flexibility in the prompt
  fakeAnswers: z.array(z.string()),
  points: z.number().int(),
  difficulty: z.string(),
  explanation: z.string(),
});

// Define the schema for an array of questions
const QuestionsArraySchema = z.array(QuestionSchema);

// Wrap the array in an object as required by OpenAI's structured output format
const InteractiveQuestionsSchema = z.object({
  questions: QuestionsArraySchema
});

/**
 * Generate interactive questions based on sermon content
 * @param game The game object containing sermon metadata
 * @param sermonContent The full sermon content (text, transcript, etc.)
 * @param instructions Additional instructions for the AI
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

IMPORTANT: Please generate between 5 to 10 varied, engaging questions based on this sermon content. 
Please use a variety of question types (multiple choice, slider, draggable, fill-in-the-blanks) to test different aspects of understanding.
For point values, assign between 5-50 points per question based on difficulty, with harder questions worth more points.
Ensure each question follows the provided schema structure exactly.

Make sure to return JSON format.

For the correctAnswer field, use the appropriate format based on the question type:
- For single-answer-multiple-choice and true-false: a string with the correct answer
- For multiple-answer-multiple-choice: an array of strings with all correct answers
- For slider: a number
- For drag-drop types: an object with the appropriate structure as shown in the examples


## References:
export interface SingleMatchDraggableAnswer {
    type: 'single-match-draggable';
    // The item that needs to be matched – e.g., a bible verse.
    draggableItem: string;
    // The list of possible drop zone labels (themes).
    options: string[];
    // The correct option from the above list.
    correctOption: string;
  }
  
  // 2. Multiple-Match Draggable
  export interface MultipleMatchDraggableAnswer {
    type: 'multiple-match-draggable';
    // The list of items (e.g., verses) that need matching.
    draggableItems: string[];
    // A list of available drop zones (e.g., themes).
    dropZones: string[];
    // Mapping of each draggable item to its correct drop zone.
    correctMapping: { [draggableItem: string]: string };
  }
  
  // 3. Multiple-Match True/False Draggable
  export interface MultipleMatchTrueFalseDraggableAnswer {
    type: 'multiple-match-true-false-draggable';
    // The statements that need to be classified.
    statements: string[];
    // Mapping each statement to a boolean (true for correct, false for incorrect).
    correctMapping: { [statement: string]: boolean };
  }
  
  // 4. Fill-in-the-Blanks Draggable
  export interface FillInTheBlanksDraggableAnswer {
    type: 'fill-in-the-blanks-draggable';
    // A sentence with placeholder tokens or markers (e.g., "For God so loved the {blank1}").
    sentenceTemplate: string;
    // Details for each blank: an ID to reference in the UI and its correct option.
    blanks: Array<{
      id: string;
      correctOption: string;
    }>;
    // The pool of draggable options that users can choose from.
    options: string[];
  }
  
export type QuestionType = 
| 'single-answer-multiple-choice'
    | 'multiple-answer-multiple-choice'
    | 'slider'
    | 'true-false'
    // Existing drag-drop types if you still want to support them...
    | 'single-answer-drag-drop'
    | 'multiple-answer-drag-drop'
    // New draggable formats:
    | 'single-match-draggable'
    | 'multiple-match-draggable'
    | 'multiple-match-true-false-draggable'
    | 'fill-in-the-blanks-draggable';

    export type Answer = 
    | string
    | string[]
    | number
    | { [key: string]: string }  // (existing mapping)
    | SingleMatchDraggableAnswer
    | MultipleMatchDraggableAnswer
    | MultipleMatchTrueFalseDraggableAnswer
    | FillInTheBlanksDraggableAnswer;

export interface IQuestion extends Document {
  _id: Types.ObjectId;
  type: QuestionType;
  question: string;
  correctAnswer: Answer
  fakeAnswers: string[];
  gameId: Types.ObjectId;
  points: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  explanation?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema: Schema<IQuestion> = new Schema(
  {
    type: { 
      type: String, 
      required: true 
    },
    question: { type: String, required: true },
    correctAnswer: { 
      type: Schema.Types.Mixed, 
      required: true 
    },
    fakeAnswers: [{ type: String, required: true }],
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    points: { type: Number, default: 10, required: true },
    difficulty: { 
      type: String, 
      enum: ['easy', 'medium', 'hard'],
      required: false 
    },
    explanation: { type: String, required: false },
    order: { type: Number, required: true }
  },
  {
    collection: 'questions',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
);


## Example Questions:
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
  },
  {
    id: 'q6',
    type: 'single-match-draggable',
    question: 'Drag the Bible verse to the correct theme:',
    correctAnswer: {
      type: 'single-match-draggable',
      draggableItem: 'The Lord is my shepherd; I shall not want.',
      options: ['Protection', 'Guidance', 'Judgment', 'Creation'],
      correctOption: 'Guidance'
    },
    fakeAnswers: [],
    points: 15,
    difficulty: 'medium',
    explanation: 'This verse from Psalm 23:1 is about God\'s guidance in our lives.',
    order: 6
  },
  {
    id: 'q7',
    type: 'multiple-match-draggable',
    question: 'Match each verse to its correct theme:',
    correctAnswer: {
      type: 'multiple-match-draggable',
      draggableItems: [
        'In the beginning God created the heavens and the earth.',
        'For God so loved the world that He gave His only Son.',
        'The wages of sin is death, but the gift of God is eternal life.'
      ],
      dropZones: ['Creation', 'Love', 'Salvation', 'Judgment'],
      correctMapping: {
        'In the beginning God created the heavens and the earth.': 'Creation',
        'For God so loved the world that He gave His only Son.': 'Love',
        'The wages of sin is death, but the gift of God is eternal life.': 'Salvation'
      }
    },
    fakeAnswers: [],
    points: 25,
    difficulty: 'hard',
    explanation: 'Each verse represents a key theological theme in the Bible.',
    order: 7
  },
  {
    id: 'q8',
    type: 'multiple-match-true-false-draggable',
    question: 'Drag each statement to True or False based on biblical teaching:',
    correctAnswer: {
      type: 'multiple-match-true-false-draggable',
      statements: [
        'Jesus had 12 disciples.',
        'Moses wrote all of the Pentateuch.',
        'Paul wrote the book of Hebrews.',
        'John was the youngest disciple.'
      ],
      correctMapping: {
        'Jesus had 12 disciples.': true,
        'Moses wrote all of the Pentateuch.': true,
        'Paul wrote the book of Hebrews.': false,
        'John was the youngest disciple.': true
      }
    },
    fakeAnswers: [],
    points: 20,
    difficulty: 'medium',
    explanation: 'Some of these statements are biblically accurate, while others are common misconceptions.',
    order: 8
  },
  {
    id: 'q9',
    type: 'fill-in-the-blanks-draggable',
    question: 'Complete the verse by dragging the correct words into the blanks:',
    correctAnswer: {
      type: 'fill-in-the-blanks-draggable',
      sentenceTemplate: 'For God so loved the {blank1} that He gave His only {blank2}, that whoever {blank3} in Him should not {blank4} but have everlasting life.',
      blanks: [
        { id: 'blank1', correctOption: 'world' },
        { id: 'blank2', correctOption: 'Son' },
        { id: 'blank3', correctOption: 'believes' },
        { id: 'blank4', correctOption: 'perish' }
      ],
      options: ['world', 'Son', 'believes', 'perish', 'people', 'Word', 'trusts', 'suffer']
    },
    fakeAnswers: [],
    points: 30,
    difficulty: 'hard',
    explanation: 'This is John 3:16, one of the most well-known verses in the Bible.',
    order: 9
  }
];
`;

    // Make the API call to OpenAI with structured output using Zod
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: "You are an expert in creating interactive educational questions based on sermon content. You will generate a variety of question types that engage users and test their understanding."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" }, // Use simpler JSON mode instead of strict schema
      temperature: 0.7,
      max_tokens: 4000
    });

    // Get the result content as string
    const responseContent = completion.choices[0].message.content;
    
    if (!responseContent) {
      throw new Error('No content returned from the API');
    }
    
    // Parse the response JSON
    const parsedResponse = JSON.parse(responseContent) as { questions: any[] };
    
    if (!parsedResponse || !parsedResponse.questions) {
      throw new Error('Response missing questions data');
    }
    
    const questions = parsedResponse.questions;
    
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Failed to generate valid questions from AI');
    }
    
    console.log(`Generated ${questions.length} questions successfully`, questions);
    
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
