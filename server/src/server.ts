import { createServer } from 'http';
import { startServer } from './app';
import logger from './utils/logger';
import setUpSocket from './config/socket';

const PORT = process.env.PORT!

startServer().then((app) => {
  const server = createServer(app);
  const io = setUpSocket(server)
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
});