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
import { Category } from 'src/categories/entities/category.entity';
import { City } from '../../cities/entities/city.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'text', nullable: true })
  about?: string;

  @Column({ type: 'date', nullable: true })
  birthdate?: Date;

  @ManyToOne(() => City)
  @JoinColumn({ name: 'cityId' })
  city?: City;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender?: Gender;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Exclude()
  @Column({ type: 'varchar', length: 500, nullable: true })
  refreshToken?: string | null;

  @OneToMany(() => Skill, (skill) => skill.owner, { cascade: true })
  skills?: Skill[];

  @ManyToMany(() => Category)
  @JoinTable()
  wantToLearn: Category[];

  @ManyToMany(() => Skill)
  @JoinTable({
    name: 'user_favorite_skills',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'skillId', referencedColumnName: 'id' },
  })
  favoriteSkills?: Skill[];
}
