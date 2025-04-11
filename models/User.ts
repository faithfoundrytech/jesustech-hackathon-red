import mongoose, { Schema, Document, Model, Types } from 'mongoose';


export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  gender?: string;
  clerkId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    gender: { type: String, required: false },
    clerkId: { type: String, required: false }
  },
  {
    collection: 'users',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
