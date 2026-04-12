import { IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiProperty({
    description: 'Номер страницы',
    default: 1,
    minimum: 1,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @ApiProperty({
    description: 'Количество элементов на странице',
    default: 20,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit: number = 20;
}
