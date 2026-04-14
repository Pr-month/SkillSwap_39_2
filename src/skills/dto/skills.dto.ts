import {
  IsString,
  IsOptional,
  MinLength,
  Length,
  IsEmail,
  ValidateNested,
} from 'class-validator';
import { Type, Exclude } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OwnerDTO {
  @ApiProperty({
    description: 'Уникальный идентификатор владельца',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Имя владельца',
    example: 'John Doe',
    minLength: 1,
    maxLength: 100,
  })
  @Length(1, 100)
  name: string;

  @ApiProperty({
    description: 'Email владельца',
    example: 'john@example.com',
  })
  @IsEmail()
  email: string;

  @Exclude()
  password?: string;

  @Exclude()
  createdAt?: Date;

  @Exclude()
  updatedAt?: Date;

  @Exclude()
  refreshToken?: string;

  @Exclude()
  role?: string;
}

export class SkillDto {
  @ApiProperty({
    description: 'Уникальный идентификатор навыка',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Название навыка',
    example: 'Английский для путешествий',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  title: string;

  @ApiPropertyOptional({
    description: 'Описание навыка',
    example: 'Разговорные шаблоны, аудирование, базовая грамматика и словарь для поездок.',
    minLength: 2,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  description: string;

  @ApiPropertyOptional({
    description: 'Категория навыка',
    example: 'Английский язык',
    minLength: 2,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  category: string;

  @ApiPropertyOptional({
    description: 'URL изображений навыка',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    type: [String],
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  images?: string[];

  @ApiProperty({
    description: 'Владелец навыка',
    type: () => OwnerDTO,
  })
  @ValidateNested()
  @Type(() => OwnerDTO)
  owner: OwnerDTO;
}
