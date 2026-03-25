import { ConflictException, Injectable } from '@nestjs/common';
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

  async create(dto: CreateSkillDto): Promise<Skill> {
    const existing = await this.skillsRepository.findOne({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Skill already exists');
    }

    const skill = this.skillsRepository.create({ name: dto.name });
    return this.skillsRepository.save(skill);
  }

  findAll(): Promise<Skill[]> {
    return this.skillsRepository.find({ order: { name: 'ASC' } });
  }
}
