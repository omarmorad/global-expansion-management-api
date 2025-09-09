import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { Vendor } from '../entities/vendor.entity';
import { Match } from '../entities/match.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    private notificationsService: NotificationsService,
  ) {}

  async rebuildMatches(projectId: number): Promise<Match[]> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['client'],
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Find eligible vendors
    const vendors = await this.vendorRepository
      .createQueryBuilder('vendor')
      .where('vendor.is_active = :active', { active: true })
      .andWhere('JSON_EXTRACT(vendor.countries_supported, "$") LIKE :country', {
        country: `%"${project.country}"%`,
      })
      .getMany();

    // Clear existing matches
    await this.matchRepository.delete({ project_id: projectId });

    const matches: Match[] = [];

    for (const vendor of vendors) {
      const score = this.calculateMatchScore(project, vendor);
      if (score > 0) {
        const match = this.matchRepository.create({
          project_id: projectId,
          vendor_id: vendor.id,
          score,
        });

        const savedMatch = await this.matchRepository.save(match);
        matches.push(savedMatch);

        // Send notification
        await this.notificationsService.sendMatchNotification(
          project,
          vendor,
          score,
        );
      }
    }

    return matches;
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

    return Math.round(score * 100) / 100; // Round to 2 decimal places
  }

  private calculateSlaWeight(slaHours: number): number {
    // Better SLA (lower hours) gets higher weight
    if (slaHours <= 4) return 2;
    if (slaHours <= 12) return 1.5;
    if (slaHours <= 24) return 1;
    if (slaHours <= 48) return 0.5;
    return 0;
  }

  async getProjectMatches(projectId: number): Promise<Match[]> {
    return this.matchRepository.find({
      where: { project_id: projectId },
      relations: ['vendor'],
      order: { score: 'DESC' },
    });
  }
}
