import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: '7b9c5b7c-2a90-4c58-9a8f-2b9a2f06f3d1' })
  id: string;

  @ApiProperty({ example: 'Programming' })
  name: string;

  @ApiPropertyOptional({
    example: null,
    nullable: true,
    description: 'ID родительской категории (null для корневой)',
  })
  parentId: string | null;

  @ApiProperty({
    type: () => [CategoryResponseDto],
    description: 'Дочерние категории',
    example: [],
  })
  children: CategoryResponseDto[];
}
