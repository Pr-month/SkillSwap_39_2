import { IsInt, Min, IsOptional, Max} from 'class-validator';
import { Type } from 'class-transformer';

export class FindSimilarSkillsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}