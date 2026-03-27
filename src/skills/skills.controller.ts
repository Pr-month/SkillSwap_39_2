import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RequestWithUser } from 'src/auth/types/request-with-user.interface';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { Skill } from './entities/skill.entity';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  findAll(): Promise<Skill[]> {
    return this.skillsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: RequestWithUser, @Body() dto: CreateSkillDto): Promise<Skill> {
    return this.skillsService.create(dto, req.user.sub);
  }
}
