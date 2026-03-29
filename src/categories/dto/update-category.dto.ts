import { IsString, IsOptional, IsUUID, Length } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @Length(1, 200)
  name: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
