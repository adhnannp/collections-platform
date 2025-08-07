import mongoose, { Schema } from 'mongoose';

export interface IActivity extends mongoose.Document {
  accountId: mongoose.Types.ObjectId;
  type: string;
  description: string;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>({
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
}, { timestamps: true });

activitySchema.index({ accountId: 1, createdAt: -1 });

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);