import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Client } from './client.entity';
import { Match } from './match.entity';

export enum ProjectStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled'
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  client_id: number;

  @Column({ length: 100 })
  country: string;

  @Column('simple-json')
  services_needed: string[];

  @Column('decimal', { precision: 12, scale: 2 })
  budget: number;

  @Column({
    type: 'text',
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE
  })
  status: ProjectStatus;

  @ManyToOne(() => Client, client => client.projects)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @OneToMany(() => Match, match => match.project)
  matches: Match[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}