import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ResearchService } from './research.service';
import { CreateResearchDocumentDto } from './dto/create-research-document.dto';
import { SearchResearchDocumentDto } from './dto/search-research-document.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('research')
@UseGuards(JwtAuthGuard)
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post()
  create(
    @Body(ValidationPipe) createResearchDocumentDto: CreateResearchDocumentDto,
  ) {
    return this.researchService.create(createResearchDocumentDto);
  }

  @Get()
  findAll() {
    return this.researchService.findAll();
  }

  @Get('search')
  search(@Query(ValidationPipe) searchDto: SearchResearchDocumentDto) {
    return this.researchService.search(searchDto);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.researchService.findByProject(+projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.researchService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.researchService.remove(id);
  }
}
