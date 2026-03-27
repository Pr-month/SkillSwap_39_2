import { Controller, Patch, Param, Body, UseGuards, Req, Delete } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { IRequestWithUser } from '../auth/types/express';
import { RequestWithUser } from 'src/auth/types/request-with-user.interface';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) { }

  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    return this.skillsService.getSkillsWithPagination(query);
  }
  
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: RequestWithUser, @Body() dto: CreateSkillDto): Promise<Skill> {
    return this.skillsService.create(dto, req.user.sub);
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
}
