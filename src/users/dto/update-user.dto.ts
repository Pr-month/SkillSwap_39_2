import {
  IsOptional,
  IsString,
  IsDate,
  IsEnum,
  IsUrl,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../users.enums';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Иван Иванов',
    description: 'Имя пользователя',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiPropertyOptional({
    example: 'О себе...',
    description: 'Информация о пользователе',
  })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiPropertyOptional({ example: '1990-01-01', description: 'Дата рождения' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthdate?: Date;

  @ApiPropertyOptional({ example: 'uuid-city-123', description: 'ID города' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  cityId?: string;

  @ApiPropertyOptional({
    enum: Gender,
    example: Gender.MALE,
    description: 'Пол',
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'URL аватара',
  })
  @IsOptional()
  @IsUrl()
  avatar?: string;
}
