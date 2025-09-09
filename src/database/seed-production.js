const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');

// Import entities (compiled JS versions)
const { Client } = require('../../dist/entities/client.entity');
const { Project } = require('../../dist/entities/project.entity');
const { Vendor } = require('../../dist/entities/vendor.entity');
const { Match } = require('../../dist/entities/match.entity');

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE_PATH || './data/database.sqlite',
  entities: [Client, Project, Vendor, Match],
  synchronize: true,
  logging: false,
});

async function seedProductionDatabase() {
  try {
    console.log('🌱 Starting production database seeding...');

    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    // Create data directory if it doesn't exist
    const fs = require('fs');
    const path = require('path');
    const dataDir = path.dirname(
      process.env.DATABASE_PATH || './data/database.sqlite',
    );
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Seed Clients
    const clientRepository = AppDataSource.getRepository(Client);

    // Check if admin already exists
    const existingAdmin = await clientRepository.findOne({
      where: { contact_email: 'admin@expanders360.com' },
    });

    if (!existingAdmin) {
      const adminClient = clientRepository.create({
        company_name: 'Expanders360 Admin',
        contact_email: 'admin@expanders360.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
      });

      const testClient = clientRepository.create({
        company_name: 'TechCorp International',
        contact_email: 'client@techcorp.com',
        password: await bcrypt.hash('client123', 10),
        role: 'client',
      });

      const savedClients = await clientRepository.save([
        adminClient,
        testClient,
      ]);
      console.log('✅ Clients seeded:', savedClients.length);

      // Seed Vendors
      const vendorRepository = AppDataSource.getRepository(Vendor);

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
          countries_supported: [
            'Japan',
            'Singapore',
            'Australia',
            'South Korea',
          ],
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
      console.log('✅ Vendors seeded:', savedVendors.length);

      // Seed Projects
      const projectRepository = AppDataSource.getRepository(Project);

      const projects = [
        {
          client_id: testClient.id,
          country: 'Germany',
          services_needed: ['legal', 'accounting'],
          budget: 50000,
          status: 'active',
        },
        {
          client_id: testClient.id,
          country: 'Japan',
          services_needed: ['hr', 'marketing'],
          budget: 75000,
          status: 'active',
        },
        {
          client_id: testClient.id,
          country: 'USA',
          services_needed: ['legal', 'hr', 'marketing'],
          budget: 100000,
          status: 'active',
        },
      ];

      const savedProjects = await projectRepository.save(projects);
      console.log('✅ Projects seeded:', savedProjects.length);
    } else {
      console.log('ℹ️  Database already seeded, skipping...');
    }

    await AppDataSource.destroy();
    console.log('✅ Production database seeding completed!');
  } catch (error) {
    console.error('❌ Production seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedProductionDatabase();
}

module.exports = { seedProductionDatabase };
