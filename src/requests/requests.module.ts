import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { Request } from './entities/request.entity';
import { User } from 'src/users/entities/user.entity';
import { Skill } from 'src/skills/entities/skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Request, User, Skill])],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
