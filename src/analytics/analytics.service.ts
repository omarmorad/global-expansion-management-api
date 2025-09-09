import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../entities/match.entity';
import { Vendor } from '../entities/vendor.entity';
import { Project, ProjectStatus } from '../entities/project.entity';
import { ResearchService } from '../research/research.service';

export interface TopVendorAnalytics {
  country: string;
  topVendors: {
    vendor: Vendor | null;
    avgMatchScore: number;
    matchCount: number;
  }[];
  researchDocumentCount: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private researchService: ResearchService,
  ) {}

  async getTopVendorsByCountry(): Promise<TopVendorAnalytics[]> {
    // Get all countries from projects
    const countries = await this.projectRepository
      .createQueryBuilder('project')
      .select('DISTINCT project.country', 'country')
      .getRawMany();

    const analytics: TopVendorAnalytics[] = [];

    for (const { country } of countries) {
      // Get top vendors for this country based on matches in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const vendorStats = await this.matchRepository
        .createQueryBuilder('match')
        .leftJoin('match.vendor', 'vendor')
        .leftJoin('match.project', 'project')
        .select([
          'vendor.id as vendorId',
          'vendor.name as vendorName',
          'vendor.rating as vendorRating',
          'vendor.response_sla_hours as vendorSla',
          'AVG(match.score) as avgScore',
          'COUNT(match.id) as matchCount',
        ])
        .where('project.country = :country', { country })
        .andWhere('match.created_at >= :date', { date: thirtyDaysAgo })
        .groupBy('vendor.id')
        .orderBy('avgScore', 'DESC')
        .limit(3)
        .getRawMany();

      const topVendors = await Promise.all(
        vendorStats.map(async (stat) => {
          const vendor = await this.vendorRepository.findOne({
            where: { id: stat.vendorId },
          });
          return {
            vendor,
            avgMatchScore: parseFloat(stat.avgScore),
            matchCount: parseInt(stat.matchCount),
          };
        }),
      );

      // Count research documents for expansion projects in this country
      const researchDocumentCount =
        await this.researchService.countByCountry(country);

      analytics.push({
        country,
        topVendors,
        researchDocumentCount,
      });
    }

    return analytics;
  }

  async getMatchingStats(): Promise<any> {
    const totalMatches = await this.matchRepository.count();
    const avgScore = await this.matchRepository
      .createQueryBuilder('match')
      .select('AVG(match.score)', 'avgScore')
      .getRawOne();

    const matchesByCountry = await this.matchRepository
      .createQueryBuilder('match')
      .leftJoin('match.project', 'project')
      .select(['project.country as country', 'COUNT(match.id) as count'])
      .groupBy('project.country')
      .getRawMany();

    return {
      totalMatches,
      averageScore: parseFloat(avgScore.avgScore) || 0,
      matchesByCountry,
    };
  }

  async getProjectStats(): Promise<any> {
    const totalProjects = await this.projectRepository.count();
    const activeProjects = await this.projectRepository.count({
      where: { status: ProjectStatus.ACTIVE },
    });

    const projectsByCountry = await this.projectRepository
      .createQueryBuilder('project')
      .select(['project.country as country', 'COUNT(project.id) as count'])
      .groupBy('project.country')
      .getRawMany();

    const avgBudget = await this.projectRepository
      .createQueryBuilder('project')
      .select('AVG(project.budget)', 'avgBudget')
      .getRawOne();

    return {
      totalProjects,
      activeProjects,
      projectsByCountry,
      averageBudget: parseFloat(avgBudget.avgBudget) || 0,
    };
  }

  async getVendorStats(): Promise<any> {
    const totalVendors = await this.vendorRepository.count();
    const activeVendors = await this.vendorRepository.count({
      where: { is_active: true },
    });

    const avgRating = await this.vendorRepository
      .createQueryBuilder('vendor')
      .select('AVG(vendor.rating)', 'avgRating')
      .getRawOne();

    const avgSla = await this.vendorRepository
      .createQueryBuilder('vendor')
      .select('AVG(vendor.response_sla_hours)', 'avgSla')
      .getRawOne();

    return {
      totalVendors,
      activeVendors,
      averageRating: parseFloat(avgRating.avgRating) || 0,
      averageSlaHours: parseFloat(avgSla.avgSla) || 0,
    };
  }
}
