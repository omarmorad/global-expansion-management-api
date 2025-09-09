import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { MatchingService } from './matching.service';
import { Project } from '../entities/project.entity';
import { Client } from '../entities/client.entity';
import { Vendor } from '../entities/vendor.entity';
import { Match } from '../entities/match.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Client, Vendor, Match]),
    NotificationsModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, MatchingService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
