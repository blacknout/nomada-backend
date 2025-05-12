#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

// Get database config
const config = require('../config/config.js')[process.env.NODE_ENV || 'development'];

// Use the database URL directly from config
const dbUrl = config.url;

// Create Sequelize instance
const sequelize = new Sequelize(dbUrl, {
  dialect: config.dialect,
  logging: console.log,
});

// Test connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
}

// Get a list of migration files
function getMigrationFiles() {
  const files = fs.readdirSync(__dirname)
    .filter(file => {
      // Must be a JS file
      if (!file.endsWith('.js')) return false;
      
      // Skip this script
      if (file === 'migrate.js') return false;
      
      // Skip migrations.ts
      if (file === 'migrations.ts') return false;
      
      // Must start with numbers (date format)
      if (!/^\d{8,}/.test(file)) return false;
      
      return true;
    })
    .sort(); // Sort by name (which should be date)
  
  return files;
}

// Run a single migration
async function runMigration(file, queryInterface) {
  const filePath = path.join(__dirname, file);
  console.log(`Running migration: ${file}`);
  
  // Load the migration
  const migration = require(filePath);
  
  if (!migration.up || typeof migration.up !== 'function') {
    console.warn(`Warning: ${file} does not have an up() function and will be skipped.`);
    return false;
  }
  
  // Execute the migration
  await migration.up(queryInterface, Sequelize);
  return true;
}

// Add migration to SequelizeMeta
async function recordMigration(file, queryInterface) {
  await queryInterface.bulkInsert('SequelizeMeta', [{
    name: file
  }]);
}

// Check if SequelizeMeta table exists, create if it doesn't
async function ensureMetaTable(queryInterface) {
  try {
    // Check if the table exists
    await queryInterface.showAllTables();
    
    // Create SequelizeMeta table if it doesn't exist
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('SequelizeMeta'));
    
    if (!tableExists) {
      console.log('Creating SequelizeMeta table');
      await queryInterface.createTable('SequelizeMeta', {
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          primaryKey: true
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error creating SequelizeMeta table:', error);
    return false;
  }
}

// Get list of already applied migrations
async function getAppliedMigrations(queryInterface) {
  try {
    // Check if the table exists first
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('SequelizeMeta'));
    
    if (!tableExists) {
      return [];
    }
    
    const result = await sequelize.query(
      'SELECT name FROM "SequelizeMeta" ORDER BY name',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    return result.map(item => item.name);
  } catch (error) {
    console.error('Error getting applied migrations:', error);
    return [];
  }
}

// Run all pending migrations
async function runMigrations() {
  try {
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error('Database connection failed.');
      console.error('This script is designed to run inside Docker only.');
      console.error('Run with: docker compose exec app npm run migrate:docker');
      process.exit(1);
    }
    
    console.log('Current script path:', __filename);
    console.log('Looking for migrations in:', __dirname);
    
    const queryInterface = sequelize.getQueryInterface();
    
    // Ensure SequelizeMeta table exists
    await ensureMetaTable(queryInterface);
    
    // Get list of migration files
    const files = getMigrationFiles();
    console.log('Found migration files:', files);
    
    // Get already applied migrations
    const appliedMigrations = await getAppliedMigrations(queryInterface);
    console.log('Already applied migrations:', appliedMigrations);
    
    // Filter out already applied migrations
    const pendingMigrations = files.filter(file => !appliedMigrations.includes(file));
    console.log('Pending migrations:', pendingMigrations);
    
    if (pendingMigrations.length === 0) {
      console.log('No pending migrations to run.');
      process.exit(0);
    }
    
    // Run each pending migration
    console.log('Running migrations...');
    let completed = 0;
    
    for (const file of pendingMigrations) {
      const success = await runMigration(file, queryInterface);
      if (success) {
        await recordMigration(file, queryInterface);
        completed++;
      }
    }
    
    console.log(`Completed ${completed} migrations.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    console.error('\nThis script is designed to run inside Docker only.');
    console.error('Run with: docker compose exec app npm run migrate:docker');
    process.exit(1);
  }
}

// Execute the migrations
runMigrations();
