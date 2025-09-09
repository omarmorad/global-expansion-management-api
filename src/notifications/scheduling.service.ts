import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../entities/project.entity';
import { Vendor } from '../entities/vendor.entity';
import { Match } from '../entities/match.entity';
import { NotificationsService } from './notifications.service';

@Injectable()
export class SchedulingService {
  private readonly logger = new Logger(SchedulingService.name);

  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    private notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async refreshDailyMatches() {
    this.logger.log('Starting daily match refresh...');

    try {
      // Get all active projects
      const activeProjects = await this.projectRepository.find({
        where: { status: ProjectStatus.ACTIVE },
        relations: ['client'],
      });

      let totalMatches = 0;

      for (const project of activeProjects) {
        // Find eligible vendors for this project
        const vendors = await this.vendorRepository
          .createQueryBuilder('vendor')
          .where('vendor.is_active = :active', { active: true })
          .andWhere(
            'JSON_EXTRACT(vendor.countries_supported, "$") LIKE :country',
            {
              country: `%"${project.country}"%`,
            },
          )
          .getMany();

        // Clear existing matches for this project
        await this.matchRepository.delete({ project_id: project.id });

        // Generate new matches
        for (const vendor of vendors) {
          const score = this.calculateMatchScore(project, vendor);
          if (score > 0) {
            const match = this.matchRepository.create({
              project_id: project.id,
              vendor_id: vendor.id,
              score,
            });

            await this.matchRepository.save(match);
            totalMatches++;

            // Send notification for high-score matches
            if (score >= 8) {
              await this.notificationsService.sendMatchNotification(
                project,
                vendor,
                score,
              );
            }
          }
        }
      }

      this.logger.log(
        `Daily match refresh completed. ${totalMatches} matches generated.`,
      );
      await this.notificationsService.sendDailyMatchSummary(totalMatches);
    } catch (error) {
      this.logger.error(`Daily match refresh failed: ${error.message}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkSlaViolations() {
    this.logger.log('Checking for SLA violations...');

    try {
      // Find vendors with potentially expired SLAs
      const expiredSlaVendors = await this.vendorRepository.find({
        where: { response_sla_hours: 72 }, // Example threshold
        relations: ['matches'],
      });

      for (const vendor of expiredSlaVendors) {
        await this.notificationsService.sendSlaViolationAlert(vendor);
      }

      this.logger.log(
        `SLA check completed. ${expiredSlaVendors.length} violations found.`,
      );
    } catch (error) {
      this.logger.error(`SLA check failed: ${error.message}`);
    }
  }

  private calculateMatchScore(project: Project, vendor: Vendor): number {
    // Check country support
    if (!vendor.countries_supported.includes(project.country)) {
      return 0;
    }

    // Calculate service overlap
    const serviceOverlap = project.services_needed.filter((service) =>
      vendor.services_offered.includes(service),
    ).length;

    if (serviceOverlap === 0) {
      return 0;
    }

    // Score formula: services_overlap * 2 + rating + SLA_weight
    const slaWeight = this.calculateSlaWeight(vendor.response_sla_hours);
    const score = serviceOverlap * 2 + vendor.rating + slaWeight;

    return Math.round(score * 100) / 100;
  }

  private calculateSlaWeight(slaHours: number): number {
    if (slaHours <= 4) return 2;
    if (slaHours <= 12) return 1.5;
    if (slaHours <= 24) return 1;
    if (slaHours <= 48) return 0.5;
    return 0;
  }
}
