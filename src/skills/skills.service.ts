import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) { }

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
