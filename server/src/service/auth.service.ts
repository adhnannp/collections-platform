import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';
import redisClient from '../config/redis';

const JWT_SECRET = process.env.JWT_SECRET!;

export class AuthService {
  static async register(email: string, password: string, role: string): Promise<IUser> {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error('User already exists');

    const user = new User({ email, password, role });
    await user.save();
    return user;
  }

  static async login(email: string, password: string): Promise<string> {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');

    if (user.lockedUntil && user.lockedUntil > Date.now()) {
      throw new Error('Account locked. Try again later.');
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      user.failedAttempts += 1;
      if (user.failedAttempts >= 5) {
        user.lockedUntil = Date.now() + 30 * 60 * 1000;
      }
      await user.save();
      throw new Error('Invalid credentials');
    }

    user.failedAttempts = 0;
    user.lockedUntil = null;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    await redisClient.setEx(`session:${user._id}`, 3600, token);
    return token;
  }

  static async verifyToken(token: string): Promise<IUser> {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    const session = await redisClient.get(`session:${decoded.id}`);
    if (session !== token) throw new Error('Invalid session');
    const user = await User.findById(decoded.id);
    if (!user) throw new Error('User not found');
    return user;
  }
}