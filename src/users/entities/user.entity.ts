import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsDate,
  IsEnum,
  IsUrl,
  Length,
} from 'class-validator';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  @Length(1, 100)
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @IsEmail()
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  @Length(6, 255)
  password: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  about?: string;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDate()
  birthdate?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @Column({ type: 'varchar', length: 500, nullable: true })
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ type: 'varchar', length: 500, nullable: true })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}