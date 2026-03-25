import { IsString, IsOptional, MinLength } from 'class-validator';

export class SkillDto {
  @IsString()
  id: string;

  @IsString()
  @MinLength(2)
  title: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  description: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  category: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  images: string[]; 
}