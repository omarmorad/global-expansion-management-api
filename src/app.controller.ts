import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getApiInfo() {
    return {
      name: 'Global Expansion Management API',
      version: '1.0.0',
      description:
        'Backend system for managing global expansion projects and vendor matching',
      endpoints: {
        auth: '/api/auth',
        projects: '/api/projects',
        vendors: '/api/vendors',
        research: '/api/research',
        analytics: '/api/analytics',
      },
      documentation: 'See README.md for detailed API documentation',
      status: 'operational',
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
