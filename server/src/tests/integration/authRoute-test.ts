import request from 'supertest';
import app from '../../app';
import { connectDB } from '../../config/database';

describe('Auth Routes', () => {
  beforeAll(async () => {
    await connectDB();
  });

  it('POST /api/auth/register should create a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123', role: 'Viewer' });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe('test@example.com');
  });
});