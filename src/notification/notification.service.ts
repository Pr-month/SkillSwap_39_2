import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notification.gateway';
import { NotificationPayloadDTO } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly gateway: NotificationsGateway) {}

  notifyUser(userId: string, payload: NotificationPayloadDTO) {
    this.gateway.sendToUser(userId, payload);
  }
}
