import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { SkillDto } from './dto/skills.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './entities/skill.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  async getSkillsWithPagination(paginationQuery: PaginationQueryDto): Promise<{
    data: SkillDto[];
    page: number;
    totalPages: number;
  }> {
    const page = Math.max(1, Number(paginationQuery.page) || 1);
    const limit = Math.min(20, Math.max(1, Number(paginationQuery.limit) || 5));
    const offset = (Number(page) - 1) * limit;

    // Получаем сущности из БД
    const [skills, totalSkills] = await this.skillRepository.findAndCount({
      take: limit,
      skip: offset,
      order: { id: 'ASC' },
      relations: ['owner'],
    });

    const data: SkillDto[] = plainToInstance(SkillDto, skills);

    const totalPages = Math.ceil(totalSkills / Number(limit));

    if (page > totalPages) {
      throw new NotFoundException(
        `Страница ${page} не существует. Доступно всего ${totalPages} страниц.`,
      );
    }

    return {
      data,
      page,
      totalPages,
    };
  }
}

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

  async update(id: string, userId: string, updateSkillDto: UpdateSkillDto) {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    if (skill.userId !== userId) {
      throw new ForbiddenException('You can update only your own skill');
    }

    Object.assign(skill, updateSkillDto);
    return await this.skillsRepository.save(skill);
  }
  
  async deleteSkill(skillId: string, userId: string): Promise<void> {
    const skill = await this.skillsRepository.findOne({
      where: { id: skillId },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    if (skill.userId !== userId) {
      throw new ForbiddenException('You can delete only your own skill');
    }

    await this.skillsRepository.delete(skillId);
  }
}
