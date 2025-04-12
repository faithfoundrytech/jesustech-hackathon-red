import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IChurch } from './Church';
import { IUser } from './User';

export type ShopItemStatus = 'active' | 'inactive' | 'redeemed';
export type ShopItemType = 'physical' | 'digital' | 'service';

export interface IShopItem extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  pointCost: number;
  quantity: number;
  status: ShopItemStatus;
  type: ShopItemType;
  churchId: Types.ObjectId;
  imageUrl?: string;
  createdBy: Types.ObjectId;
  redeemedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ShopItemSchema: Schema<IShopItem> = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    pointCost: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    status: { 
      type: String, 
      enum: ['active', 'inactive', 'redeemed'],
      default: 'active',
      required: true 
    },
    type: { 
      type: String, 
      enum: ['physical', 'digital', 'service'],
      required: true 
    },
    churchId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Church', 
      required: true 
    },
    imageUrl: { type: String, required: false },
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    redeemedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: false 
    }
  },
  {
    collection: 'shop_items',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  }
);

const ShopItem: Model<IShopItem> =
  mongoose.models.ShopItem || mongoose.model<IShopItem>('ShopItem', ShopItemSchema);

export default ShopItem;
