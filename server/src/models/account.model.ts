import mongoose, { Schema } from 'mongoose';

export interface IAccount extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  mobileNumber: string;
  address: string;
  balance: number;
  status: 'active' | 'inactive' | 'delinquent';
  isListed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new Schema<IAccount>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  address: { type: String, required: true },
  balance: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'delinquent'], default: 'active' },
  isListed: { type: Boolean, default: true },
}, { timestamps: true });

accountSchema.index({ name: 'text' });

export const Account = mongoose.model<IAccount>('Account', accountSchema);
