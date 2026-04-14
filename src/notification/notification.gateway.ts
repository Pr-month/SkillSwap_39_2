import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,  
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { SocketWithUser } from './notification.types';
import { WsJwtGuard } from 'src/guards/ws-jwt.guard';
import {  NotificationPayloadDTO } from './dto/notification.dto';


@Injectable()
@WebSocketGateway({ cors: true })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly wsJwtGuard: WsJwtGuard) {}

  handleConnection(client: SocketWithUser) {
    try {
      const payload = this.wsJwtGuard.verifyClient(client);
      client.user = payload;
      client.join(payload.sub);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: SocketWithUser) {
  }

  sendToUser(userId: string, payload: NotificationPayloadDTO) {
    this.server.to(userId).emit('notification', payload);
  }
}