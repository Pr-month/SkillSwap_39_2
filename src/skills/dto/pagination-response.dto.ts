import { ApiProperty } from '@nestjs/swagger';
import { SkillDto } from './skills.dto';

export class PaginationResponseDto {
  @ApiProperty({
    description: 'Массив навыков',
  })
  data: SkillDto[];

  @ApiProperty({
    description: 'Текущая страница',
    example: 1,
    minimum: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Общее количество страниц',
    example: 5,
    minimum: 1,
  })
  totalPages: number;
}
