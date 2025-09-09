import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Client } from '../entities/client.entity';
import { Vendor } from '../entities/vendor.entity';
import { Project, ProjectStatus } from '../entities/project.entity';

export async function seedDatabase(dataSource: DataSource) {
  console.log('Starting database seeding...');

  // Seed Clients
  const clientRepository = dataSource.getRepository(Client);

  let adminClient = await clientRepository.findOneBy({
    contact_email: 'admin@expanders360.com',
  });
  if (!adminClient) {
    adminClient = clientRepository.create({
      company_name: 'Expanders360 Admin',
      contact_email: 'admin@expanders360.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
    });
    await clientRepository.save(adminClient);
    console.log('Admin client seeded.');
  } else {
    console.log('Admin client already exists.');
  }

  let testClient = await clientRepository.findOneBy({
    contact_email: 'client@techcorp.com',
  });
  if (!testClient) {
    testClient = clientRepository.create({
      company_name: 'TechCorp International',
      contact_email: 'client@techcorp.com',
      password: await bcrypt.hash('client123', 10),
      role: 'client',
    });
    await clientRepository.save(testClient);
    console.log('Test client seeded.');
  } else {
    console.log('Test client already exists.');
  }

  // Seed Vendors
  const vendorRepository = dataSource.getRepository(Vendor);

  const vendors = [
    {
      name: 'Global Expansion Partners',
      countries_supported: ['USA', 'Canada', 'UK', 'Germany'],
      services_offered: ['legal', 'accounting', 'hr', 'marketing'],
      rating: 4.8,
      response_sla_hours: 12,
      is_active: true,
    },
    {
      name: 'European Business Solutions',
      countries_supported: ['Germany', 'France', 'Spain', 'Italy'],
      services_offered: ['legal', 'accounting', 'compliance'],
      rating: 4.5,
      response_sla_hours: 24,
      is_active: true,
    },
    {
      name: 'Asia Pacific Consultants',
      countries_supported: ['Japan', 'Singapore', 'Australia', 'South Korea'],
      services_offered: ['hr', 'marketing', 'operations'],
      rating: 4.2,
      response_sla_hours: 8,
      is_active: true,
    },
    {
      name: 'Americas Growth Hub',
      countries_supported: ['USA', 'Mexico', 'Brazil', 'Argentina'],
      services_offered: ['legal', 'hr', 'marketing', 'operations'],
      rating: 4.6,
      response_sla_hours: 16,
      is_active: true,
    },
    {
      name: 'Nordic Business Network',
      countries_supported: ['Sweden', 'Norway', 'Denmark', 'Finland'],
      services_offered: ['accounting', 'compliance', 'hr'],
      rating: 4.9,
      response_sla_hours: 6,
      is_active: true,
    },
  ];

  const savedVendors = await vendorRepository.save(vendors);
  console.log('Vendors seeded:', savedVendors.length);

  // Seed Projects
  const projectRepository = dataSource.getRepository(Project);

  const projects = [
    {
      client_id: testClient.id,
      country: 'Germany',
      services_needed: ['legal', 'accounting'],
      budget: 50000,
      status: ProjectStatus.ACTIVE,
    },
    {
      client_id: testClient.id,
      country: 'Japan',
      services_needed: ['hr', 'marketing'],
      budget: 75000,
      status: ProjectStatus.ACTIVE,
    },
    {
      client_id: testClient.id,
      country: 'USA',
      services_needed: ['legal', 'hr', 'marketing'],
      budget: 100000,
      status: ProjectStatus.ACTIVE,
    },
    {
      client_id: testClient.id,
      country: 'Sweden',
      services_needed: ['accounting', 'compliance'],
      budget: 40000,
      status: ProjectStatus.ON_HOLD,
    },
  ];

  const savedProjects = await projectRepository.save(projects);
  console.log('Projects seeded:', savedProjects.length);

  console.log('Database seeding completed!');
  console.log('Test credentials:');
  console.log('Admin: admin@expanders360.com / admin123');
  console.log('Client: client@techcorp.com / client123');
}
