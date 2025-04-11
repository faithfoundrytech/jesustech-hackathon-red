import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IUser } from './User';
import { IChurch } from './Church';

export type StaffRole = 'pastor' | 'admin' | 'secretary' | 'worship_leader' | 'youth_pastor' | 'volunteer_coordinator' | 'other';

export interface IStaff extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  churchId: Types.ObjectId;
  role: StaffRole;
  title?: string;
  permissions?: string[];
  isActive: boolean;
  joinedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema: Schema<IStaff> = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    churchId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Church', 
      required: true 
    },
    role: { 
      type: String, 
      enum: ['pastor', 'admin', 'secretary', 'worship_leader', 'youth_pastor', 'volunteer_coordinator', 'other'],
      required: true 
    },
    title: { 
      type: String, 
      required: false 
    },
    permissions: [{ 
      type: String, 
      required: false 
    }],
    isActive: { 
      type: Boolean, 
      default: true, 
      required: true 
    },
    joinedAt: { 
      type: Date, 
      default: Date.now, 
      required: true 
    },
    notes: { 
      type: String, 
      required: false 
    }
  },
  {
    collection: 'staff',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
);

// Create compound index to ensure a user can only have one staff role per church
StaffSchema.index({ userId: 1, churchId: 1 }, { unique: true });
// Index for querying staff by church
StaffSchema.index({ churchId: 1 });
// Index for querying staff by role
StaffSchema.index({ role: 1 });

const Staff: Model<IStaff> =
  mongoose.models.Staff || mongoose.model<IStaff>('Staff', StaffSchema);

export default Staff;
