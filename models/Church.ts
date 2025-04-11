import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IUser } from './User';

export interface IChurch extends Document {
  _id: Types.ObjectId;
  name: string;
  location: string;
  description: string;
  creatorId: Types.ObjectId;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChurchSchema: Schema<IChurch> = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String, required: false }
  },
  {
    collection: 'churches',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
);

const Church: Model<IChurch> =
  mongoose.models.Church || mongoose.model<IChurch>('Church', ChurchSchema);

export default Church;
