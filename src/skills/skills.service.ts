import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSkillDto } from './dto/create-skill.dto';
import { Skill } from './entities/skill.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  async create(dto: CreateSkillDto, ownerId: string): Promise<Skill> {
    const skill = this.skillsRepository.create({
      name: dto.name,
      description: dto.description,
      images: dto.images,
      owner: { id: ownerId },
    });
    return this.skillsRepository.save(skill);
  }

  findAll(): Promise<Skill[]> {
    return this.skillsRepository.find({ order: { name: 'ASC' } });
  }
}
