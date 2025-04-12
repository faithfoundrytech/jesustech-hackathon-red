import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IGame } from './Game';

// 1. Single-Match Draggable
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

const Question: Model<IQuestion> =
  mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);

export default Question;
