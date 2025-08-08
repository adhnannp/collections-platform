import { createServer } from 'http';
import { Server } from 'socket.io';
import { startServer } from './app';
import { container } from './di/container';
import { ISocketHandler } from './core/interface/controller/Isocket.controller';
import { TYPES } from './di/types';
import logger from './utils/logger';

const PORT = process.env.PORT!
const socketHandler = container.get<ISocketHandler>(TYPES.SocketController);

startServer().then((app) => {
  const server = createServer(app);
  const io = new Server(server, {
    cors: { origin: '*' },
  });

  socketHandler.initialize(io);
  
  app.set('io', io);

  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
});