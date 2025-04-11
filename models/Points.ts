import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IUser } from './User';
import { IGame } from './Game';
import { IChurch } from './Church';

export type PointsTransactionType = 'earned' | 'spent' | 'expired' | 'adjustment';
export type PointsSource = 'game_completion' | 'streak_bonus' | 'admin_bonus' | 'reward_redemption' | 'system_adjustment';

export interface IPoints extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  transactionType: PointsTransactionType;
  source: PointsSource;
  description: string;
  gameId?: Types.ObjectId;
  churchId?: Types.ObjectId;
  referenceId?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PointsSchema: Schema<IPoints> = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    amount: { 
      type: Number, 
      required: true 
    },
    transactionType: { 
      type: String, 
      enum: ['earned', 'spent', 'expired', 'adjustment'],
      required: true 
    },
    source: { 
      type: String, 
      enum: ['game_completion', 'streak_bonus', 'admin_bonus', 'reward_redemption', 'system_adjustment'],
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    gameId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Game', 
      required: false 
    },
    churchId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Church', 
      required: false 
    },
    referenceId: { 
      type: String, 
      required: false 
    },
    expiresAt: { 
      type: Date, 
      required: false 
    }
  },
  {
    collection: 'points',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
);

// Indexes for efficient queries
PointsSchema.index({ userId: 1 });
PointsSchema.index({ userId: 1, transactionType: 1 });
PointsSchema.index({ userId: 1, createdAt: -1 });
PointsSchema.index({ gameId: 1 });
PointsSchema.index({ churchId: 1 });

// Static method to calculate a user's current points balance
PointsSchema.statics.getUserBalance = async function(userId: string): Promise<number> {
  const result = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { 
      _id: null, 
      balance: { 
        $sum: {
          $cond: [
            { $in: ["$transactionType", ["earned", "adjustment"]] },
            "$amount",
            { $multiply: ["$amount", -1] }
          ]
        } 
      } 
    }}
  ]);
  
  return result.length > 0 ? result[0].balance : 0;
};

// Create a model interface that includes the static methods
interface PointsModel extends Model<IPoints> {
  getUserBalance(userId: string): Promise<number>;
}

const Points = mongoose.models.Points as PointsModel || 
  mongoose.model<IPoints, PointsModel>('Points', PointsSchema);

export default Points;
