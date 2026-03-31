import { IsArray, IsString, Length } from 'class-validator';

export class CreateSkillDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsString()
  @Length(1, 2000)
  description: string;

  @IsArray()
  @IsString({ each: true })
  images: string[];
}
