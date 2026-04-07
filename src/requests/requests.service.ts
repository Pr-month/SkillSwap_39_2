import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { UpdateRequestStatusDto } from './dto/update-status.dto';
import { RequestStatus } from './requests.enum';
import { UserRole } from '../users/users.enums';
import { AccessTokenPayload } from '../auth/auth.types';
import { NotificationsGateway } from 'src/notification/notification.gateway';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
    private readonly notificationsGateway: NotificationsGateway,
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

  async getIncomingRequests(userId: string): Promise<Request[]> {
    return await this.requestsRepository.find({
      where: {
        receiver: { id: userId },
      },
      relations: ['sender', 'offeredSkill', 'requestedSkill'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    requestId: string,
    user: AccessTokenPayload,
    dto: UpdateRequestStatusDto,
  ): Promise<Request> {
    const newStatus: RequestStatus = dto.status;

    // Проверяем, что новый статус разрешён (принять или отклонить)
    if (![RequestStatus.ACCEPTED, RequestStatus.REJECTED].includes(newStatus)) {
      throw new ForbiddenException(
        'Можно обновить статус только до "accepted" или "rejected"',
      );
    }

    const request = await this.requestsRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Заявка не найдена');
    }

    // Обновить можно только статус входящей заявки и админ может обновить любую заявку
    const isAdmin = user.role === UserRole.ADMIN;
    const isReceiver = request.receiverId === user.sub;

    if (!isAdmin && !isReceiver) {
      throw new ForbiddenException('У вас нет прав для обновления этой заявки');
    }

    request.status = newStatus;
    const savedRequest = await this.requestsRepository.save(request);

    // Отправляем уведомление через WebSocket
    this.notificationsGateway.sendToUser(request.senderId, {
      type: 'request_updated',
      requestId: savedRequest.id,
      newStatus: savedRequest.status,
    });

    return savedRequest;
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
