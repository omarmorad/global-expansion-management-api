/**
 * Migration script to move SQLite data to MongoDB
 * Run this before deploying to Vercel
 */

const sqlite3 = require('sqlite3').verbose();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Configuration
const SQLITE_PATH = './src/data/database.sqlite';
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/global_expansion_api';

async function migrateSQLiteToMongoDB() {
  console.log('🔄 Starting SQLite to MongoDB migration...');

  // Connect to MongoDB
  const mongoClient = new MongoClient(MONGODB_URI);
  await mongoClient.connect();
  const db = mongoClient.db();
  console.log('✅ Connected to MongoDB');

  // Connect to SQLite
  const sqliteDb = new sqlite3.Database(SQLITE_PATH);
  console.log('✅ Connected to SQLite');

  try {
    // Migrate Users
    console.log('👤 Migrating users...');
    const users = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM users', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (users.length > 0) {
      const mongoUsers = users.map((user) => ({
        email: user.email,
        password: user.password, // Already hashed
        role: user.role,
        name: user.name || user.email.split('@')[0],
        company: user.company || null,
        phone: user.phone || null,
        createdAt: new Date(user.created_at || Date.now()),
        updatedAt: new Date(user.updated_at || Date.now()),
      }));

      await db.collection('users').deleteMany({}); // Clear existing
      await db.collection('users').insertMany(mongoUsers);
      console.log(`✅ Migrated ${users.length} users`);
    }

    // Migrate Clients
    console.log('🏢 Migrating clients...');
    const clients = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM clients', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (clients.length > 0) {
      const mongoClients = clients.map((client) => ({
        name: client.name,
        email: client.email,
        industry: client.industry,
        country: client.country,
        description: client.description || null,
        website: client.website || null,
        createdAt: new Date(client.created_at || Date.now()),
        updatedAt: new Date(client.updated_at || Date.now()),
      }));

      await db.collection('clients').deleteMany({}); // Clear existing
      await db.collection('clients').insertMany(mongoClients);
      console.log(`✅ Migrated ${clients.length} clients`);
    }

    // Migrate Projects
    console.log('📋 Migrating projects...');
    const projects = await new Promise((resolve, reject) => {
      sqliteDb.all(
        `
        SELECT p.*, c.name as client_name 
        FROM projects p 
        LEFT JOIN clients c ON p.client_id = c.id
      `,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        },
      );
    });

    if (projects.length > 0) {
      // Get client ObjectIds for reference
      const mongoClientsMap = {};
      const mongoClientsData = await db
        .collection('clients')
        .find({})
        .toArray();
      mongoClientsData.forEach((client) => {
        mongoClientsMap[client.name] = client._id;
      });

      const mongoProjects = projects.map((project) => ({
        clientId: mongoClientsMap[project.client_name] || null,
        name: project.name,
        description: project.description,
        status: project.status || 'active',
        budget: project.budget || 0,
        startDate: project.start_date
          ? new Date(project.start_date)
          : new Date(),
        endDate: project.end_date ? new Date(project.end_date) : null,
        createdAt: new Date(project.created_at || Date.now()),
        updatedAt: new Date(project.updated_at || Date.now()),
      }));

      await db.collection('projects').deleteMany({}); // Clear existing
      await db.collection('projects').insertMany(mongoProjects);
      console.log(`✅ Migrated ${projects.length} projects`);
    }

    // Migrate Vendors (if exists)
    console.log('🏪 Migrating vendors...');
    const vendors = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM vendors', (err, rows) => {
        if (err) {
          console.log('ℹ️  No vendors table found, skipping...');
          resolve([]);
        } else {
          resolve(rows);
        }
      });
    });

    if (vendors.length > 0) {
      const mongoVendors = vendors.map((vendor) => ({
        name: vendor.name,
        email: vendor.email,
        service: vendor.service,
        country: vendor.country,
        rating: vendor.rating || 0,
        description: vendor.description || null,
        website: vendor.website || null,
        createdAt: new Date(vendor.created_at || Date.now()),
        updatedAt: new Date(vendor.updated_at || Date.now()),
      }));

      await db.collection('vendors').deleteMany({}); // Clear existing
      await db.collection('vendors').insertMany(mongoVendors);
      console.log(`✅ Migrated ${vendors.length} vendors`);
    }

    console.log('🎉 Migration completed successfully!');

    // Print summary
    const userCount = await db.collection('users').countDocuments();
    const clientCount = await db.collection('clients').countDocuments();
    const projectCount = await db.collection('projects').countDocuments();
    const vendorCount = await db.collection('vendors').countDocuments();

    console.log('\n📊 Migration Summary:');
    console.log(`👤 Users: ${userCount}`);
    console.log(`🏢 Clients: ${clientCount}`);
    console.log(`📋 Projects: ${projectCount}`);
    console.log(`🏪 Vendors: ${vendorCount}`);
    console.log('\n✅ Ready for Vercel deployment!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    sqliteDb.close();
    await mongoClient.close();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateSQLiteToMongoDB()
    .then(() => {
      console.log('🎯 Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateSQLiteToMongoDB };
