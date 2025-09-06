import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateClientDto {
  @IsString()
  company_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  role?: string;
}