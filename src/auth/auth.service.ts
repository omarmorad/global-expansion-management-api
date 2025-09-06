import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Client } from '../entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const client = await this.clientRepository.findOne({ 
      where: { contact_email: email } 
    });
    
    if (client && await bcrypt.compare(password, client.password)) {
      const { password, ...result } = client;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const client = await this.validateUser(loginDto.email, loginDto.password);
    if (!client) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      email: client.contact_email, 
      sub: client.id, 
      role: client.role,
      company: client.company_name 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: client.id,
        email: client.contact_email,
        company: client.company_name,
        role: client.role
      }
    };
  }

  async register(createClientDto: CreateClientDto) {
    const existingClient = await this.clientRepository.findOne({
      where: { contact_email: createClientDto.email }
    });

    if (existingClient) {
      throw new UnauthorizedException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createClientDto.password, 10);
    
    const client = this.clientRepository.create({
      company_name: createClientDto.company_name,
      contact_email: createClientDto.email,
      password: hashedPassword,
      role: createClientDto.role || 'client'
    });

    const savedClient = await this.clientRepository.save(client);
    const { password, ...result } = savedClient;
    
    return result;
  }

  async findById(id: number): Promise<Client | null> {
    return this.clientRepository.findOne({ where: { id } });
  }
}