import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, Index } from 'typeorm';
import { Project } from './project.entity';
import { Vendor } from './vendor.entity';

@Entity('matches')
@Index(['project_id', 'vendor_id'], { unique: true })
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  project_id: number;

  @Column()
  vendor_id: number;

  @Column('decimal', { precision: 5, scale: 2 })
  score: number;

  @ManyToOne(() => Project, project => project.matches)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Vendor, vendor => vendor.matches)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}