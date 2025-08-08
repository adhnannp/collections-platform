import { injectable, inject } from 'inversify';
import { Server, Socket } from 'socket.io';
import { ISocketHandler } from '../core/interface/controller/Isocket.controller';
import { IAuthService } from '../core/interface/service/Iauth.service';
import { TYPES } from '../di/types';
import { MESSAGES } from '../utils/Response.messages';
import logger from '../utils/logger';

@injectable()
export class SocketHandler implements ISocketHandler {
  constructor(
    @inject(TYPES.AuthService) private authService: IAuthService
  ) {}

  initialize(io: Server): void {
    io.use(async (socket: Socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error(MESSAGES.AUTH_ERROR));

      try {
        const user = await this.authService.verifyToken(token);
        socket.data.user = user;
        next();
      } catch (error) {
        next(new Error(MESSAGES.INVALID_TOKEN));
      }
    });

    io.on('connection', (socket: Socket) => {
      logger.info(`User ${socket.data.user._id} connected`);

      socket.on('joinAccount', (accountId: string) => {
        socket.join(`account:${accountId}`);
      });

      socket.on('disconnect', () => {
        logger.info(`User ${socket.data.user._id} disconnected`);
      });
    });
  }
}
