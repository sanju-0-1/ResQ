import { Server as SocketIOServer } from 'socket.io';

export class NotificationService {
  private static ioServer: SocketIOServer | null = null;

  static init(io: SocketIOServer) {
    this.ioServer = io;
  }

  static async sendPushOrSocketAlert(
    userIds: string[],
    title: string,
    body: string,
    data?: any
  ) {
    console.log(`[NotificationService] Sending notification to ${userIds.length} specific users & responders room: "${title}" - ${body}`);
    if (this.ioServer) {
      const payload = {
        title,
        body,
        data,
        timestamp: new Date().toISOString(),
      };

      // Broadcast to targeted user rooms
      userIds.forEach((id) => {
        this.ioServer?.to(`user_${id}`).emit('notification:push', payload);
      });

      // Also broadcast to active responders room so all online responders receive the alert
      this.ioServer.to('responders_room').emit('notification:push', payload);
    }
  }
}
