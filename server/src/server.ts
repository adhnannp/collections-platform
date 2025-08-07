import { createServer } from 'http';
import { Server } from 'socket.io';
import { startServer } from './app';
import { authMiddleware } from './middleware/auth.middleware';
import { AuthService } from './service/auth.service';

const PORT = process.env.PORT!

startServer().then((app) => {
  const server = createServer(app);
  const io = new Server(server, {
    cors: { origin: '*' },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      const user = await AuthService.verifyToken(token);
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.data.user._id} connected`);

    socket.on('joinAccount', (accountId: string) => {
      socket.join(`account:${accountId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.data.user._id} disconnected`);
    });
  });

  app.set('io', io);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});