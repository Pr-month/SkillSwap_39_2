import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsUUID, Length } from 'class-validator';

export class CreateSkillDto {
  @ApiProperty({
    description: 'Название навыка',
    example: 'Английский для путешествий',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  title: string;

  @ApiProperty({
    description: 'Описание навыка',
    example:
      'Разговорные шаблоны, аудирование, базовая грамматика и словарь для поездок.',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @Length(1, 2000)
  description: string;

  @ApiProperty({
    description: 'URL изображений навыка',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiProperty({
    description: 'ID категории навыка',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  categoryId: string;
}
