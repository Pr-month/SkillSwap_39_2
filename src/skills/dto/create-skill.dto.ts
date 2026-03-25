import { IsString, Length } from 'class-validator';

export class CreateSkillDto {
  @IsString()
  @Length(1, 100)
  name: string;
}

