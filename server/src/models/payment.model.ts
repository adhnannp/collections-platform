import mongoose, { Schema } from 'mongoose';

export type paymentStatus = 'pending' | 'completed' | 'failed';

export interface IPayment extends mongoose.Document {
  accountId: mongoose.Types.ObjectId;
  amount: number;
  status: paymentStatus
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
}, { timestamps: true });


paymentSchema.index({ accountId: 1, createdAt: -1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);