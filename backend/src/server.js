import 'dotenv/config';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { prisma } from './config/database.js';
import { registerSocketHandler } from './socket/socketHandler.js';

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET wajib diatur');
const port = Number(process.env.PORT) || 3000;
const httpServer = createServer(app);
const origins = (process.env.CORS_ORIGIN || '').split(',').map(v => v.trim()).filter(Boolean);
const io = new Server(httpServer, { cors: { origin: origins } });
app.set('io', io);
registerSocketHandler(io);
httpServer.listen(port, () => console.log(`Kasir API aktif di port ${port}`));

const shutdown = async () => {
  await prisma.$disconnect();
  httpServer.close(() => process.exit(0));
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('unhandledRejection', (error) => { console.error('Unhandled rejection', error); shutdown(); });
