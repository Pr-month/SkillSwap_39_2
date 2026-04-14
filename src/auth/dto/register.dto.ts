import {
  IsDateString,
  IsDefined,
  IsEmail,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { Gender } from '../../users/users.enums';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsDefined()
  @MinLength(2)
  name: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsString()
  @IsNotEmpty()
  cityId: string;

  @IsString()
  about: string;

  @IsDateString()
  @IsISO8601()
  @IsNotEmpty()
  birthdate: string;
}
