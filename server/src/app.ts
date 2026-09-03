import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env';
import { connectDB } from './config/db';
import apiRoutes from './routes/index';
import { setupSocketHandlers } from './sockets/emergencySocket';
import { NotificationService } from './services/notificationService';
import { globalErrorHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with CORS
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

// Pass Socket.IO instance to notification service and socket handlers
NotificationService.init(io);
setupSocketHandlers(io);

// Security and utility middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to API routes
app.use('/api', apiRateLimiter, apiRoutes);

// Global Error Handler
app.use(globalErrorHandler);

// Connect Database & Start Server
const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(ENV.PORT, () => {
      console.log(`\n==================================================`);
      console.log(`🚀 ResQ Emergency Backend Server is Running!`);
      console.log(`🌐 API Base URL: http://localhost:${ENV.PORT}/api`);
      console.log(`⚡ Socket.IO Ready: ws://localhost:${ENV.PORT}`);
      console.log(`==================================================\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();

export { app, httpServer, io };
