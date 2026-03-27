import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { SkillDto } from './dto/skills.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { Skill } from './entities/skill.entity';

@Injectable()
export class SkillsService {
  private skillRepository: Repository<Skill>;

  constructor(private dataSource: DataSource) {
    this.skillRepository = dataSource.getRepository(Skill);
  }

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