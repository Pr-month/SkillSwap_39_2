import {
  IsString,
  IsOptional,
  MinLength,
  Length,
  IsEmail,
  ValidateNested,
} from 'class-validator';
import { Type, Exclude } from 'class-transformer';

export class OwnerDTO {
  @IsString()
  id: string;

  @Length(1, 100)
  name: string;

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
  images?: string[];

  @ValidateNested()
  @Type(() => OwnerDTO)
  owner: OwnerDTO;
}