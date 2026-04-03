import {
  Controller,
  Get,
  Query,
  Post,
  UseGuards,
  Req,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { IRequestWithUser } from 'src/auth/types/express';
import { RequestWithUser } from 'src/auth/types/request-with-user.interface';
import { CreateSkillDto } from './dto/create-skill.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './entities/skill.entity';
import { SkillsService } from './skills.service';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    return this.skillsService.getSkillsWithPagination(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() req: RequestWithUser,
    @Body() dto: CreateSkillDto,
  ): Promise<Skill> {
    return this.skillsService.create(dto, req.user.sub);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  async addFavorite(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    await this.skillsService.addFavoriteSkill(req.user.sub, id);
    return { message: 'Skill added to favorites' };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: IRequestWithUser,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    return this.skillsService.update(id, req.user!.id, updateSkillDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteSkill(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    await this.skillsService.deleteSkill(id, req.user.sub);

    return { message: 'Skill deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/favorite')
  async removeFavorite(@Param('id') id: string, @Req() req: RequestWithUser) {
    await this.skillsService.removeFavoriteSkill(req.user.sub, id);
    return { message: 'Skill removed from favorites' };
  }
}
