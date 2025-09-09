import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { MatchingService } from './matching.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly matchingService: MatchingService,
  ) {}

  @Post()
  create(
    @Body(ValidationPipe) createProjectDto: CreateProjectDto,
    @Request() req,
  ) {
    return this.projectsService.create(createProjectDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    return this.projectsService.findAll(req.user.userId, req.user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.projectsService.findOne(+id, req.user.userId, req.user.role);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateProjectDto: UpdateProjectDto,
    @Request() req,
  ) {
    return this.projectsService.update(
      +id,
      updateProjectDto,
      req.user.userId,
      req.user.role,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.projectsService.remove(+id, req.user.userId, req.user.role);
  }

  @Post(':id/matches/rebuild')
  async rebuildMatches(@Param('id') id: string) {
    return this.matchingService.rebuildMatches(+id);
  }

  @Get(':id/matches')
  async getMatches(@Param('id') id: string) {
    return this.matchingService.getProjectMatches(+id);
  }
}
