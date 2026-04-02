import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { User } from '../users/entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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
  ): Promise<Request>  {
    const [sender, offeredSkill, requestedSkill] = await Promise.all([
      this.usersRepository.findOneBy({ id: userId }),
      this.skillsRepository.findOneBy({ id: dto.offeredSkillId }),
      this.skillsRepository.findOneBy({ id: dto.requestedSkillId }),
    ]);

    if (!sender) throw new NotFoundException('Sender user not found');
    if (!offeredSkill) throw new NotFoundException('Offered skill not found');
    if (!requestedSkill) throw new NotFoundException('Requested skill not found');

     const request = this.requestsRepository.create({
      sender,
      offeredSkill,
      requestedSkill,
      isRead: false,
    });

    return this.requestsRepository.save(request);
  }
}
