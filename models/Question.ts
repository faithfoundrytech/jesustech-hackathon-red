import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IGame } from './Game';

export type QuestionType = 'single-answer-multiple-choice' | 'multiple-answer-multiple-choice' | 'slider' | 'single-answer-drag-drop' | 'multiple-answer-drag-drop' | 'true-false';

export interface IQuestion extends Document {
  _id: Types.ObjectId;
  type: QuestionType;
  question: string;
  correctAnswer: string | string[] | number;
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
      enum: ['multiple-choice', 'slider', 'drag-drop', 'true-false'],
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
