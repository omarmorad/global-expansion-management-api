import {
  IsString,
  IsArray,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateVendorDto {
  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  countries_supported: string[];

  @IsArray()
  @IsString({ each: true })
  services_offered: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  response_sla_hours?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
