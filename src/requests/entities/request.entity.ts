import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RequestStatus } from '../requests.enum';
import { Skill } from 'src/skills/entities/skill.entity';

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  sender: User;

  @Column()
  senderId: string;

  @ManyToOne(() => User)
  receiver: User;

  @Column()
  receiverId: string;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @ManyToOne(() => Skill)
  offeredSkill: Skill;

  @ManyToOne(() => Skill)
  requestedSkill: Skill;  

  @Column({ default: false })
  isRead: boolean;
}
