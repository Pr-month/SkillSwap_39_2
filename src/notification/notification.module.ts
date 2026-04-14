import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notification.gateway';
import { NotificationsService } from './notification.service';
import { WsJwtGuard } from 'src/guards/ws-jwt.guard';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [
    NotificationsGateway,
    NotificationsService,
    WsJwtGuard,
    JwtService,
  ],
  exports: [NotificationsGateway, NotificationsService],
})
export class NotificationModule {}
