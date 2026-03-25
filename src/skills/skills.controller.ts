import { Controller, Get, Query } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { PaginationQueryDto } from './dto/pagination-query.dto'

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    return this.skillsService.getSkillsWithPagination(query);
  }
  
}
