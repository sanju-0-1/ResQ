import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';
import { storage } from './storage';

let socketInstance: Socket | null = null;

export const socketService = {
  async connect(): Promise<Socket> {
    const token = await storage.getAccessToken();

    if (socketInstance && socketInstance.connected) {
      return socketInstance;
    }

    socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('[SocketService] Connected to real-time server:', socketInstance?.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[SocketService] Disconnected:', reason);
    });

    return socketInstance;
  },

  getSocket(): Socket | null {
    return socketInstance;
  },

  on(event: string, callback: (...args: any[]) => void) {
    if (socketInstance) {
      socketInstance.on(event, callback);
    }
  },

  off(event: string, callback?: (...args: any[]) => void) {
    if (socketInstance) {
      socketInstance.off(event, callback);
    }
  },

  disconnect() {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
  },

  joinEmergencyRoom(incidentId: string) {
    if (socketInstance) {
      socketInstance.emit('emergency:join', { incidentId });
    }
  },

  leaveEmergencyRoom(incidentId: string) {
    if (socketInstance) {
      socketInstance.emit('emergency:leave', { incidentId });
    }
  },

  sendChatMessage(incidentId: string, content: string) {
    if (socketInstance) {
      socketInstance.emit('chat:send', { incidentId, content });
    }
  },

  streamLocation(latitude: number, longitude: number, incidentId?: string) {
    if (socketInstance) {
      socketInstance.emit('location:stream', { latitude, longitude, incidentId });
    }
  },
};
