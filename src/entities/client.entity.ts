import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from './project.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  company_name: string;

  @Column({ length: 255, unique: true })
  contact_email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ default: 'client' })
  role: string;

  @OneToMany(() => Project, project => project.client)
  projects: Project[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}