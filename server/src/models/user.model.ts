import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export type UserRole = 'Admin' | 'Manager' | 'Agent' | 'Viewer';
export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  role: UserRole;
  failedAttempts: number;
  lockedUntil: number | null;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Manager', 'Agent', 'Viewer'], default: 'Viewer' },
  failedAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Number, default: null },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);