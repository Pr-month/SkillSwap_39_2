import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { Request } from './entities/request.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { Skill } from 'src/skills/entities/skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Request, Skill]), NotificationModule],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
