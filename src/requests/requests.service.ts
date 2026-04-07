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
import { Skill } from '../skills/entities/skill.entity';
import { CreateRequestDto } from './dto/create-request.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
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

  async createRequests(
    userId: string,
    dto: CreateRequestDto,
  ): Promise<Request> {
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

    return this.requestsRepository.save(request);
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
    return await this.requestsRepository.save(request);
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
