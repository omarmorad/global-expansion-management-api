import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Match } from '../entities/match.entity';
import { Vendor } from '../entities/vendor.entity';
import { Project } from '../entities/project.entity';
import { ResearchModule } from '../research/research.module';

@Module({
  imports: [TypeOrmModule.forFeature([Match, Vendor, Project]), ResearchModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
