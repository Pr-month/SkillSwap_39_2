import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateSkillDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
