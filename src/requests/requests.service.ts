import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { Skill } from '../skills/entities/skill.entity';

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
      throw new BadRequestException('Offered skill does not belong to the sender');

    const request = this.requestsRepository.create({
      senderId: userId,
      receiverId: requestedSkill.owner.id,
      offeredSkill,
      requestedSkill,
    });

    return this.requestsRepository.save(request);
  }
}
