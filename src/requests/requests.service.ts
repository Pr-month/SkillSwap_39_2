import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
import { Skill } from '../skills/entities/skill.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestDto } from './dto/request.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
    private readonly notificationsGateway: NotificationsGateway,
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  public toRequestDto(request: Request): RequestDto {
    return {
      id: request.id,
      createdAt: request.createdAt,
      senderId: request.senderId,
      sender: request.sender
        ? {
            id: request.sender.id,
            name: request.sender.name,
            email: request.sender.email,
          }
        : null,
      receiverId: request.receiverId,
      receiver: request.receiver
        ? {
            id: request.receiver.id,
            name: request.receiver.name,
            email: request.receiver.email,
          }
        : null,
      status: request.status,
      isRead: request.isRead,
      offeredSkill: request.offeredSkill
        ? {
            id: request.offeredSkill.id,
            title: request.offeredSkill.name,
            category: request.offeredSkill.category?.name || '',
          }
        : null,
      requestedSkill: request.requestedSkill
        ? {
            id: request.requestedSkill.id,
            title: request.requestedSkill.name,
            category: request.requestedSkill.category?.name || '',
          }
        : null,
    };
  }

  async getOutgoingRequests(userId: string): Promise<RequestDto[]> {
    const requests = await this.requestsRepository.find({
      where: {
        sender: { id: userId },
      },
      relations: ['receiver', 'offeredSkill', 'requestedSkill'],
      order: { createdAt: 'DESC' },
    });

    return requests.map((request) => this.toRequestDto(request));
  }

  async createRequests(
    userId: string,
    dto: CreateRequestDto,
  ): Promise<RequestDto> {
    const requestedSkill = await this.skillsRepository.findOne({
      where: { id: dto.requestedSkillId },
      relations: ['owner'],
    });

    if (!requestedSkill)
      throw new NotFoundException('Requested requestedSkillId not found');

    //Нельзя отправлять заявки самому себе
    if (requestedSkill.owner.id === userId)
      throw new BadRequestException('Cannot send request to yourself');

    const offeredSkill = await this.skillsRepository.findOne({
      where: { id: dto.offeredSkillId },
      relations: ['owner'],
    });

    if (!offeredSkill)
      throw new NotFoundException('Requested offeredSkillId not found');

    //Отправленный навык пренадлежит отправителю,
    if (offeredSkill.owner?.id !== userId)
      throw new BadRequestException(
        'Offered skill does not belong to the sender',
      );

    const request = this.requestsRepository.create({
      senderId: userId,
      receiverId: requestedSkill.owner.id,
      offeredSkill,
      requestedSkill,
    });

    const savedRequest = await this.requestsRepository.save(request);
    return this.toRequestDto(savedRequest);
  }

  async getIncomingRequests(userId: string): Promise<RequestDto[]> {
    const requests = await this.requestsRepository.find({
      where: {
        receiver: { id: userId },
      },
      relations: ['sender', 'offeredSkill', 'requestedSkill'],
      order: { createdAt: 'DESC' },
    });

    return requests.map((request) => this.toRequestDto(request));
  }

  async updateStatus(
    requestId: string,
    user: AccessTokenPayload,
    dto: UpdateRequestStatusDto,
  ): Promise<RequestDto> {
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

    return this.toRequestDto(savedRequest);
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
