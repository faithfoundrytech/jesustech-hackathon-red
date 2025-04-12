import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IUser } from './User';
import { IGame } from './Game';
import { IChurch } from './Church';
import { Answer, IQuestion } from './Question';

export type UserGameStatus = 'playing' | 'completed' | 'archived';

interface UserAnswer {
  questionId: Types.ObjectId;
  userAnswer: Answer
  correct: boolean;
  pointsEarned: number;
}

export interface IUserGame extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  gameId: Types.ObjectId;
  churchId: Types.ObjectId;
  answers: UserAnswer[];
  score: number;
  totalPointsEarned: number;
  status: UserGameStatus;
  firstPlay: boolean;
  startedAt: Date;
  completedAt?: Date;
  timeSpentSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserGameSchema: Schema<IUserGame> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    churchId: { type: Schema.Types.ObjectId, ref: 'Church', required: true },
    answers: [{
      questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
      userAnswer: { type: Schema.Types.Mixed, required: true },
      correct: { type: Boolean, required: true },
      pointsEarned: { type: Number, default: 0, required: true }
    }],
    score: { type: Number, default: 0, required: true },
    totalPointsEarned: { type: Number, default: 0, required: true },
    status: { 
      type: String, 
      enum: ['playing', 'completed', 'archived'],
      default: 'playing',
      required: true 
    },
    firstPlay: { type: Boolean, default: true },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, required: false },
    timeSpentSeconds: { type: Number, required: false }
  },
  {
    collection: 'user_games',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
);

// Index for querying user games
UserGameSchema.index({ userId: 1, gameId: 1 }, { unique: true });
UserGameSchema.index({ churchId: 1, gameId: 1 });
UserGameSchema.index({ status: 1 });

const UserGame: Model<IUserGame> =
  mongoose.models.UserGame || mongoose.model<IUserGame>('UserGame', UserGameSchema);

export default UserGame;
