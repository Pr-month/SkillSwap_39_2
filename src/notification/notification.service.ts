import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notification.gateway';

@Injectable()
export class NotificationsService {
  constructor(private readonly gateway: NotificationsGateway) {}

  notifyUser(userId: string, payload: any) {
    this.gateway.sendToUser(userId, payload);
  }
}