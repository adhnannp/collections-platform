import { AuthService } from '../../service/auth.service';
import { User } from '../../models/user.model';
import mongoose from 'mongoose';

describe('AuthService', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('should register a new user', async () => {
    const user = await AuthService.register('test@example.com', 'password123', 'Viewer');
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe('Viewer');
  });

  it('should fail to register duplicate email', async () => {
    await AuthService.register('test@example.com', 'password123', 'Viewer');
    await expect(AuthService.register('test@example.com', 'password123', 'Viewer')).rejects.toThrow('User already exists');
  });
});