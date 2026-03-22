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

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthdate?: Date;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsUrl()
  avatar?: string;
}
