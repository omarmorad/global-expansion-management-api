const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Simple entity definitions for seeding
const entities = [
  {
    name: 'Client',
    tableName: 'clients',
    columns: {
      id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
      company_name: 'VARCHAR NOT NULL',
      contact_email: 'VARCHAR UNIQUE NOT NULL',
      password: 'VARCHAR NOT NULL',
      role: 'VARCHAR DEFAULT "client"',
      created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    },
  },
  {
    name: 'Vendor',
    tableName: 'vendors',
    columns: {
      id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
      name: 'VARCHAR NOT NULL',
      countries_supported: 'TEXT',
      services_offered: 'TEXT',
      rating: 'DECIMAL(3,2)',
      response_sla_hours: 'INTEGER',
      is_active: 'BOOLEAN DEFAULT 1',
      created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    },
  },
  {
    name: 'Project',
    tableName: 'projects',
    columns: {
      id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
      client_id: 'INTEGER NOT NULL',
      country: 'VARCHAR NOT NULL',
      services_needed: 'TEXT',
      budget: 'INTEGER',
      status: 'VARCHAR DEFAULT "active"',
      created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    },
  },
  {
    name: 'Match',
    tableName: 'matches',
    columns: {
      id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
      project_id: 'INTEGER NOT NULL',
      vendor_id: 'INTEGER NOT NULL',
      match_score: 'DECIMAL(5,2)',
      status: 'VARCHAR DEFAULT "pending"',
      created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    },
  },
];

async function seedProductionDatabase() {
  try {
    console.log('🌱 Starting production database seeding...');

    // Create data directory if it doesn't exist
    const dbPath = process.env.DATABASE_PATH || './data/database.sqlite';
    const dataDir = path.dirname(dbPath);

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('📁 Created data directory:', dataDir);
    }

    const AppDataSource = new DataSource({
      type: 'sqlite',
      database: dbPath,
      synchronize: false,
      logging: false,
    });

    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    const queryRunner = AppDataSource.createQueryRunner();

    // Create tables
    for (const entity of entities) {
      const columnDefs = Object.entries(entity.columns)
        .map(([name, type]) => `${name} ${type}`)
        .join(', ');

      const createTableSQL = `CREATE TABLE IF NOT EXISTS ${entity.tableName} (${columnDefs})`;
      await queryRunner.query(createTableSQL);
      console.log(`✅ Table created: ${entity.tableName}`);
    }

    // Check if data already exists
    const existingClients = await queryRunner.query(
      'SELECT COUNT(*) as count FROM clients',
    );

    if (existingClients[0].count === 0) {
      // Seed Clients
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      const clientPasswordHash = await bcrypt.hash('client123', 10);

      await queryRunner.query(
        `
        INSERT INTO clients (company_name, contact_email, password, role) VALUES 
        ('Expanders360 Admin', 'admin@expanders360.com', ?, 'admin'),
        ('TechCorp International', 'client@techcorp.com', ?, 'client')
      `,
        [adminPasswordHash, clientPasswordHash],
      );
      console.log('✅ Clients seeded: 2');

      // Seed Vendors
      const vendors = [
        [
          'Global Expansion Partners',
          '["USA","Canada","UK","Germany"]',
          '["legal","accounting","hr","marketing"]',
          4.8,
          12,
          1,
        ],
        [
          'European Business Solutions',
          '["Germany","France","Spain","Italy"]',
          '["legal","accounting","compliance"]',
          4.5,
          24,
          1,
        ],
        [
          'Asia Pacific Consultants',
          '["Japan","Singapore","Australia","South Korea"]',
          '["hr","marketing","operations"]',
          4.2,
          8,
          1,
        ],
        [
          'Americas Growth Hub',
          '["USA","Mexico","Brazil","Argentina"]',
          '["legal","hr","marketing","operations"]',
          4.6,
          16,
          1,
        ],
        [
          'Nordic Business Network',
          '["Sweden","Norway","Denmark","Finland"]',
          '["accounting","compliance","hr"]',
          4.9,
          6,
          1,
        ],
      ];

      for (const vendor of vendors) {
        await queryRunner.query(
          `
          INSERT INTO vendors (name, countries_supported, services_offered, rating, response_sla_hours, is_active) 
          VALUES (?, ?, ?, ?, ?, ?)
        `,
          vendor,
        );
      }
      console.log('✅ Vendors seeded: 5');

      // Seed Projects
      const projects = [
        [2, 'Germany', '["legal","accounting"]', 50000, 'active'],
        [2, 'Japan', '["hr","marketing"]', 75000, 'active'],
        [2, 'USA', '["legal","hr","marketing"]', 100000, 'active'],
      ];

      for (const project of projects) {
        await queryRunner.query(
          `
          INSERT INTO projects (client_id, country, services_needed, budget, status) 
          VALUES (?, ?, ?, ?, ?)
        `,
          project,
        );
      }
      console.log('✅ Projects seeded: 3');
    } else {
      console.log('ℹ️  Database already seeded, skipping...');
    }

    await queryRunner.release();
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
