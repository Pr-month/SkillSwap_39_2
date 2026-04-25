import { IsString, IsOptional, IsUUID, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiProperty({
    example: 'Design',
    description: 'Новое название категории (обязательное поле)',
  })
  @IsString()
  @Length(1, 200)
  name: string;

  @ApiPropertyOptional({
    example: '7b9c5b7c-2a90-4c58-9a8f-2b9a2f06f3d1',
    description: 'ID новой родительской категории (опционально)',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
