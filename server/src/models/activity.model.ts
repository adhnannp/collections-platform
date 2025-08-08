import mongoose, { Schema } from 'mongoose';

export type ActivityType = 'call' | 'email' | 'note';
export interface IActivity extends mongoose.Document {
  accountId: mongoose.Types.ObjectId;
  type: ActivityType;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>({
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
  type: { type: String, enum: ['call', 'email', 'note'], required: true },
  description: { type: String, required: true },
}, { timestamps: true });

activitySchema.index({ accountId: 1, createdAt: -1 });

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);