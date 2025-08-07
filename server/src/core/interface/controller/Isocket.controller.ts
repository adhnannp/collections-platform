import { Server } from 'socket.io';

export interface ISocketHandler {
  initialize(io: Server): void;
}