import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateSkillDto {
  @ApiPropertyOptional({
    description: 'Название навыка',
    example: 'Английский для путешествий обновленный',
    minLength: 2,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({
    description: 'Описание навыка',
    example:
      'Разговорные шаблоны, аудирование, базовая грамматика и словарь для поездок (Обновленный)',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
