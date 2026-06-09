import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL ?? 'http://localhost:3000', credentials: true },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NotificationsGateway.name);

  // userId → Set of socket IDs
  private userSockets = new Map<string, Set<string>>();
  // socketId → userId
  private socketUser = new Map<string, string>();

  constructor(private readonly jwt: JwtService) {}

  async handleConnection(socket: Socket) {
    const token =
      (socket.handshake.auth?.token as string) ??
      (socket.handshake.query?.token as string);

    if (!token) {
      socket.disconnect();
      return;
    }

    try {
      const payload = this.jwt.verify<{ sub: string }>(token);
      const userId = payload.sub;

      this.socketUser.set(socket.id, userId);
      if (!this.userSockets.has(userId)) this.userSockets.set(userId, new Set());
      this.userSockets.get(userId)!.add(socket.id);

      socket.join(`user:${userId}`);
      this.logger.debug(`Connected: user ${userId} (socket ${socket.id})`);
    } catch {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    const userId = this.socketUser.get(socket.id);
    if (userId) {
      this.userSockets.get(userId)?.delete(socket.id);
      if (this.userSockets.get(userId)?.size === 0) this.userSockets.delete(userId);
      this.socketUser.delete(socket.id);
    }
  }

  // Emit a notification to a specific user
  emitToUser(userId: string, event: string, data: unknown) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // Broadcast to all connected clients
  broadcast(event: string, data: unknown) {
    this.server.emit(event, data);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() socket: Socket) {
    socket.emit('pong');
  }
}
