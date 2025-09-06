import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('top-vendors')
  async getTopVendors(): Promise<any> {
    return this.analyticsService.getTopVendorsByCountry();
  }

  @Get('matching-stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getMatchingStats() {
    return this.analyticsService.getMatchingStats();
  }

  @Get('project-stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getProjectStats() {
    return this.analyticsService.getProjectStats();
  }

  @Get('vendor-stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getVendorStats() {
    return this.analyticsService.getVendorStats();
  }
}