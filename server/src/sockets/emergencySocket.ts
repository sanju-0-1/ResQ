import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { EmergencyMessage } from '../models/EmergencyMessage';
import { Emergency } from '../models/Emergency';
import { ResponderProfile } from '../models/ResponderProfile';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const setupSocketHandlers = (io: SocketIOServer) => {
  // Middleware to authenticate sockets using JWT token
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) {
        return next(new Error('Authentication token required'));
      }
      const payload = verifyAccessToken(token);
      socket.userId = payload.userId;
      socket.userRole = payload.role;
      next();
    } catch (err) {
      next(new Error('Invalid socket connection token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId;
    console.log(`[Socket.IO] Client connected: ${socket.id} (User: ${userId})`);

    if (userId) {
      socket.join(`user_${userId}`);
      socket.join('responders_room');
    }

    // Join specific emergency room
    socket.on('emergency:join', (data: { incidentId: string }) => {
      if (data?.incidentId) {
        socket.join(`emergency_${data.incidentId}`);
        console.log(`[Socket.IO] User ${userId} joined room emergency_${data.incidentId}`);
      }
    });

    // Leave emergency room
    socket.on('emergency:leave', (data: { incidentId: string }) => {
      if (data?.incidentId) {
        socket.leave(`emergency_${data.incidentId}`);
      }
    });

    // Live Location streaming from active responder or requester
    socket.on('location:stream', async (data: { latitude: number; longitude: number; incidentId?: string }) => {
      if (!userId || !data.latitude || !data.longitude) return;

      // Update responder profile location in DB
      if (socket.userRole === 'resq' || socket.userRole === 'homegirl') {
        await ResponderProfile.findOneAndUpdate(
          { userId },
          {
            currentLocation: {
              type: 'Point',
              coordinates: [data.longitude, data.latitude],
            },
          }
        );
      }

      if (data.incidentId) {
        // Broadcast location update to emergency room participants
        socket.to(`emergency_${data.incidentId}`).emit('location:updated', {
          userId,
          role: socket.userRole,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Real-time Temporary Emergency Chat
    socket.on('chat:send', async (data: { incidentId: string; content: string }) => {
      try {
        if (!userId || !data.incidentId || !data.content?.trim()) return;

        const incident = await Emergency.findById(data.incidentId);
        if (!incident || ['resolved', 'cancelled', 'expired'].includes(incident.status)) {
          socket.emit('chat:error', { message: 'Emergency session is closed or inactive.' });
          return;
        }

        const newMessage = await EmergencyMessage.create({
          incidentId: data.incidentId,
          senderId: userId,
          type: 'text',
          content: data.content.trim(),
          readBy: [userId],
        });

        const populatedMessage = await newMessage.populate('senderId', 'name username profilePhoto role');

        io.to(`emergency_${data.incidentId}`).emit('chat:message', populatedMessage);
      } catch (err) {
        console.error('[Socket.IO] Error sending chat message:', err);
      }
    });

    // Mark messages as read
    socket.on('chat:read', async (data: { incidentId: string }) => {
      if (!userId || !data.incidentId) return;
      await EmergencyMessage.updateMany(
        { incidentId: data.incidentId, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } }
      );
      io.to(`emergency_${data.incidentId}`).emit('chat:read_ack', { userId, incidentId: data.incidentId });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};
