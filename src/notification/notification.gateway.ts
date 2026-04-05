import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,  
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Injectable } from '@nestjs/common';
import { WsJwtGuard } from '../guards/ws-jwt.guard';
import { SocketWithUser } from './notification.types';

@Injectable()
@WebSocketGateway({ cors: true })
@UseGuards(WsJwtGuard)
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private users = new Map<string, string>(); 

  handleConnection(client: SocketWithUser) {
    const userId = client.user?.sub; 
    if (userId) {
      this.users.set(userId, client.id);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.users.entries()) {
      if (socketId === client.id) {
        this.users.delete(userId);
      }
    }
  }

  sendToUser(userId: string, payload: unknown) {
    const socketId = this.users.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', payload);
    }
  }
}