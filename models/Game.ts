import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IChurch } from './Church';
import { IUser } from './User';

export type GameStatus = 'pending' | 'generated' | 'rejected' | 'live' | 'archived';

export interface SermonMetadata {
  title: string;
  theme?: string;
  preacher?: string;
  date?: Date;
  mainVerses?: string[];
  sermonText?: string;
  sermonUrl?: string;
}

export interface IGame extends Document {
  _id: Types.ObjectId;
  churchId: Types.ObjectId;
  creatorId: Types.ObjectId;
  title: string;
  description?: string;
  metadata: SermonMetadata;
  status: GameStatus;
  pointsAvailable: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GameSchema: Schema<IGame> = new Schema(
  {
    churchId: { type: Schema.Types.ObjectId, ref: 'Church', required: true },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: false },
    metadata: {
      title: { type: String, required: true },
      theme: { type: String, required: false },
      preacher: { type: String, required: false },
      date: { type: Date, required: false },
      mainVerses: [{ type: String, required: false }],
      sermonText: { type: String, required: false },
      sermonUrl: { type: String, required: false }
    },
    status: { 
      type: String, 
      enum: ['pending', 'generated', 'rejected', 'live', 'archived'],
      default: 'pending', 
      required: true 
    },
    pointsAvailable: { type: Number, default: 0 },
    expiresAt: { type: Date, required: false }
  },
  {
    collection: 'games',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
);

const Game: Model<IGame> =
  mongoose.models.Game || mongoose.model<IGame>('Game', GameSchema);

export default Game;
