import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject: string;
}
