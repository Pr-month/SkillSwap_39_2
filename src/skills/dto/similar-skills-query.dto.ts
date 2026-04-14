import { IsInt, Min, IsOptional, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindSimilarSkillsQueryDto {
  @ApiPropertyOptional({
    description: 'Количество пользователей для получения',
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}
