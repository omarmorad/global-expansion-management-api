import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../entities/project.entity';
import { Client } from '../entities/client.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async create(createProjectDto: CreateProjectDto, clientId: number): Promise<Project> {
    const client = await this.clientRepository.findOne({ where: { id: clientId } });
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const project = this.projectRepository.create({
      ...createProjectDto,
      client_id: clientId,
      status: createProjectDto.status || ProjectStatus.ACTIVE,
    });

    return this.projectRepository.save(project);
  }

  async findAll(clientId?: number, role?: string): Promise<Project[]> {
    const queryBuilder = this.projectRepository.createQueryBuilder('project')
      .leftJoinAndSelect('project.client', 'client')
      .leftJoinAndSelect('project.matches', 'matches')
      .leftJoinAndSelect('matches.vendor', 'vendor');

    if (role !== 'admin' && clientId) {
      queryBuilder.where('project.client_id = :clientId', { clientId });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number, clientId?: number, role?: string): Promise<Project> {
    const queryBuilder = this.projectRepository.createQueryBuilder('project')
      .leftJoinAndSelect('project.client', 'client')
      .leftJoinAndSelect('project.matches', 'matches')
      .leftJoinAndSelect('matches.vendor', 'vendor')
      .where('project.id = :id', { id });

    if (role !== 'admin' && clientId) {
      queryBuilder.andWhere('project.client_id = :clientId', { clientId });
    }

    const project = await queryBuilder.getOne();
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto, clientId?: number, role?: string): Promise<Project> {
    const project = await this.findOne(id, clientId, role);
    
    if (role !== 'admin' && project.client_id !== clientId) {
      throw new ForbiddenException('You can only update your own projects');
    }

    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  async remove(id: number, clientId?: number, role?: string): Promise<void> {
    const project = await this.findOne(id, clientId, role);
    
    if (role !== 'admin' && project.client_id !== clientId) {
      throw new ForbiddenException('You can only delete your own projects');
    }

    await this.projectRepository.remove(project);
  }

  async findActiveProjects(): Promise<Project[]> {
    return this.projectRepository.find({
      where: { status: ProjectStatus.ACTIVE },
      relations: ['client', 'matches', 'matches.vendor'],
    });
  }
}