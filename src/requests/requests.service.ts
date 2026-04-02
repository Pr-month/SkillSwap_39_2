import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { AccessTokenPayload } from '../auth/auth.types';
import { UserRole } from '../users/users.enums';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
  ) {}

  async getOutgoingRequests(userId: string): Promise<Request[]> {
    return await this.requestsRepository.find({
      where: {
        sender: { id: userId },
      },
      relations: ['receiver', 'offeredSkill', 'requestedSkill'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteRequest(
    requestId: string,
    user: AccessTokenPayload,
  ): Promise<void> {
    const request = await this.requestsRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Заявка не найдена');
    }

    // Удалить можно только отправленную заявку и админ может удалить любую заявку
    const isAdmin = user.role === UserRole.ADMIN;
    const isSender = request.senderId === user.sub;

    if (!isAdmin && !isSender) {
      throw new ForbiddenException('У вас нет прав для удаления этой заявки');
    }

    await this.requestsRepository.delete(requestId);
  }
}
