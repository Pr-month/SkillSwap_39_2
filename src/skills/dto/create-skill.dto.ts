import { IsArray, IsString, IsUUID, Length } from 'class-validator';

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

  @IsUUID()
  categoryId: string;
}
