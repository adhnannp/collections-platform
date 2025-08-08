import { inject, injectable } from 'inversify';
import { Server as SocketIOServer, Socket } from 'socket.io';
import logger from '../utils/logger';
import ISocketHandler from '../core/interface/controller/Isocket.controller';
import { TYPES } from '../di/types';
import { IUserRepository } from '../core/interface/repository/Iuser.repository';

@injectable()
export class SocketHandler implements ISocketHandler{
  private io: SocketIOServer | undefined;

  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository
  ) {}

  initializeSocket(io: SocketIOServer): void {
    this.io = io;

    this.io.on('connection', (socket: Socket) => {
      console.log('New Socket.IO connection:', socket.id);

      socket.on('register', (userId: string) => {
        socket.join(userId);
        logger.info(`User ${userId} registered with socket ${socket.id}`);
      });

      socket.on('disconnect', () => {
        logger.info('Socket.IO disconnected:', socket.id);
      });
    });
  }

  async emitNotification(userId: string | null, notification: any, toAdmins: boolean = false): Promise<void> {
    if (!this.io) {
      logger.error('Socket.IO server not initialized');
      return;
    }

    if (toAdmins) {
      try {
        const admins = await this.userRepository.findAll({role:'Admin'});
        if(!admins){
          logger.error(`Failed to fetch admins`);
          return;
        }
        const adminIds = admins?.map((admin) => admin._id);
        for (const adminId of adminIds) {
          this.io!.to(adminId as string).emit('new_notification', {
            ...notification,
          });
          logger.info(`Admin notification sent to ${adminId}`);
        }
        if(userId){
          this.io.to(userId).emit('new_notification', notification);
          logger.info(`Notification sent to user ${userId}`);
        }
      } catch (error) {
        logger.error(`Failed to fetch admins: ${(error as Error).message}`);
      }
    } else if (userId) {
      this.io.to(userId).emit('new_notification', notification);
      logger.info(`Notification sent to user ${userId}`);
    } else {
      logger.error('No userId provided for non-admin notification');
    }
  }

}