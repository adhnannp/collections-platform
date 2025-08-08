import mongoose from 'mongoose';
import { IAuthService } from '../../core/interface/service/Iauth.service';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { HttpError } from '../../utils/http.error';
import { MESSAGES } from '../../utils/Response.messages';
import { STATUS_CODES } from '../../utils/http.statuscodes';

describe('AuthService', () => {
  let authService: IAuthService;

  beforeAll(async () => {
    await mongoose.connect('mongodb://root:example@localhost:27017/test?authSource=admin');
    authService = container.get<IAuthService>(TYPES.AuthService);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('should register a new user', async () => {
    const user = await authService.register('test@example.com', 'password123', 'Viewer');
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe('Viewer');
  });

  it('should fail to register duplicate email', async () => {
    await authService.register('test@example.com', 'password123', 'Viewer');

    try {
      await authService.register('test@example.com', 'password123', 'Viewer');
      fail('Expected HttpError to be thrown');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(HttpError);

      if (err instanceof HttpError) {
        expect(err.message).toBe(MESSAGES.USER_EXISTS);
        expect(err.statusCode).toBe(STATUS_CODES.BAD_REQUEST);
      } else {
        fail(`Unexpected error type: ${err}`);
      }
    }
  });
});
