import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import type { User } from '../../users/entities/user.entity';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  images: string[];

  @ManyToOne(
    () => require('../../users/entities/user.entity').User,
    (user: User) => user.skills,
    { nullable: false, onDelete: 'CASCADE' },
  )
  owner: User;
}