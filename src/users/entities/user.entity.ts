import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserRole, Gender } from '../users.enums';
import { Exclude } from 'class-transformer';
import { Skill } from '../../skills/entities/skill.entity';
import { Category } from '../../categories/entities/category.entity';
import { City } from '../../cities/entities/city.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Уникальный идентификатор пользователя',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Иван Иванов',
    description: 'Имя и фамилия пользователя',
  })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Электронная почта (уникальная)',
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @ApiProperty({
    example: 'Backend разработчик, люблю NestJS',
    description: 'Краткая информация о себе',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  about?: string;

  @ApiProperty({
    example: '1995-05-15',
    description: 'Дата рождения',
    required: false,
  })
  @Column({ type: 'date', nullable: true })
  birthdate?: Date;

  @ApiProperty({
    type: () => City,
    description: 'Город проживания пользователя',
  })
  @ManyToOne(() => City)
  @JoinColumn({ name: 'cityId' })
  city?: City;

  @ApiProperty({
    enum: Gender,
    example: Gender.MALE,
    description: 'Пол пользователя',
    required: false,
  })
  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender?: Gender;

  @ApiProperty({
    example: 'https://example.com/avatars/user.jpg',
    description: 'Ссылка на аватар пользователя',
    required: false,
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar?: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER,
    description: 'Роль пользователя в системе',
  })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Exclude()
  @Column({ type: 'varchar', length: 500, nullable: true })
  refreshToken?: string | null;

  @ApiProperty({
    type: () => [Skill],
    description: 'Список навыков, которыми владеет пользователь',
  })
  @OneToMany(() => Skill, (skill) => skill.owner, { cascade: true })
  skills?: Skill[];

  @ApiProperty({
    type: () => [Category],
    description: 'Категории, которые пользователь хочет изучить',
  })
  @ManyToMany(() => Category)
  @JoinTable()
  wantToLearn: Category[];

  @ApiProperty({
    type: () => [Skill],
    description: 'Избранные навыки других пользователей',
  })
  @ManyToMany(() => Skill)
  @JoinTable({
    name: 'user_favorite_skills',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'skillId', referencedColumnName: 'id' },
  })
  favoriteSkills?: Skill[];
}
