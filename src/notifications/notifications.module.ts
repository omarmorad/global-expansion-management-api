import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { SchedulingService } from './scheduling.service';
import { Project } from '../entities/project.entity';
import { Vendor } from '../entities/vendor.entity';
import { Match } from '../entities/match.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Project, Vendor, Match])],
  providers: [NotificationsService, SchedulingService],
  exports: [NotificationsService, SchedulingService],
})
export class NotificationsModule {}
