import { IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit: number = 20;
}
