import { Controller, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { IRequestWithUser } from '../auth/types/express';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: IRequestWithUser,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    return this.skillsService.update(id, req.user!.id, updateSkillDto);
  }
}
