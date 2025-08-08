import { Server as SocketIOServer } from 'socket.io';

export default interface ISocketHandler {
  initializeSocket(io: SocketIOServer): void;
  emitNotification(userId: string | null, notification: any, toAdmins: boolean): Promise<void>
}