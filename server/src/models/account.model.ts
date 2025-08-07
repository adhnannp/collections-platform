import mongoose, { Schema } from 'mongoose';

export interface IAccount extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  balance: number;
  status: 'active' | 'inactive' | 'delinquent';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

const accountSchema = new Schema<IAccount>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  balance: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'delinquent'], default: 'active' },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

accountSchema.index({ name: 'text' });

export const Account = mongoose.model<IAccount>('Account', accountSchema);