import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from '../entities/vendor.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
  ) {}

  async create(createVendorDto: CreateVendorDto): Promise<Vendor> {
    const vendor = this.vendorRepository.create({
      ...createVendorDto,
      rating: createVendorDto.rating || 0,
      response_sla_hours: createVendorDto.response_sla_hours || 24,
      is_active:
        createVendorDto.is_active !== undefined
          ? createVendorDto.is_active
          : true,
    });

    return this.vendorRepository.save(vendor);
  }

  async findAll(): Promise<Vendor[]> {
    return this.vendorRepository.find({
      relations: ['matches', 'matches.project'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({
      where: { id },
      relations: ['matches', 'matches.project'],
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }

  async update(id: number, updateVendorDto: UpdateVendorDto): Promise<Vendor> {
    const vendor = await this.findOne(id);
    Object.assign(vendor, updateVendorDto);
    return this.vendorRepository.save(vendor);
  }

  async remove(id: number): Promise<void> {
    const vendor = await this.findOne(id);
    await this.vendorRepository.remove(vendor);
  }

  async findByCountry(country: string): Promise<Vendor[]> {
    return this.vendorRepository
      .createQueryBuilder('vendor')
      .where('JSON_EXTRACT(vendor.countries_supported, "$") LIKE :country', {
        country: `%"${country}"%`,
      })
      .andWhere('vendor.is_active = :active', { active: true })
      .getMany();
  }

  async findExpiredSlaVendors(): Promise<Vendor[]> {
    // This would typically involve checking response times against SLA
    // For now, we'll return vendors with high SLA hours as potentially problematic
    return this.vendorRepository.find({
      where: { response_sla_hours: 72 }, // Example: vendors with 72+ hour SLA
      relations: ['matches'],
    });
  }
}
