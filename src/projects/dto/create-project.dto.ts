import {
  IsString,
  IsArray,
  IsNumber,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ProjectStatus } from '../../entities/project.entity';

export class CreateProjectDto {
  @IsString()
  country: string;

  @IsArray()
  @IsString({ each: true })
  services_needed: string[];

  @IsNumber()
  budget: number;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}
