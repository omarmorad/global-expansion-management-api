import { DataSource } from 'typeorm';
import { Client } from '../entities/client.entity';
import { Project } from '../entities/project.entity';
import { Vendor } from '../entities/vendor.entity';
import { Match } from '../entities/match.entity';
import { seedDatabase } from './seeds';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './database.sqlite',
  entities: [Client, Project, Vendor, Match],
  synchronize: true,
  logging: false,
});

async function runSeeds() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    await seedDatabase(AppDataSource);

    await AppDataSource.destroy();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

runSeeds();
