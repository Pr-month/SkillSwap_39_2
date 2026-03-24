import { IsEmail, IsString, Length } from 'class-validator';

export class UpdatePasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 255)
  password: string;
}
