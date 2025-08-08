import ISocketHandler from '../core/interface/controller/Isocket.controller';
import {container} from '../di/container';
import { TYPES } from '../di/types';
import { Server } from 'http';
import { Server as SocketIOServer } from 'socket.io';

const setUpSocket = (server: Server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URI,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  const socketController = container.get<ISocketHandler>(TYPES.SocketController);
  socketController.initializeSocket(io);

  return io;
};

export default setUpSocket;