import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IChurch } from './Church';

export type UserRole = 'admin' | 'pastor' | 'player';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  gender?: string;
  clerkId?: string;
  role: UserRole;
  primaryChurchId?: Types.ObjectId;
  totalPoints: number;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    gender: { type: String, required: false },
    clerkId: { type: String, required: false },
    role: { 
      type: String, 
      enum: ['admin', 'pastor', 'player'],
      default: 'player',
      required: true 
    },
    primaryChurchId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Church', 
      required: false 
    },
    totalPoints: { type: Number, default: 0 },
    profileImageUrl: { type: String, required: false }
  },
  {
    collection: 'users',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
