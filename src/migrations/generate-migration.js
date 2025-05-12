#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get arguments from command line
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Please provide a migration name and optional template type');
  console.error('Usage: node generate-migration.js <migration-name> [template-type]');
  console.error('Available templates: add-column, rename-column, create-table, default');
  process.exit(1);
}

// Generate migration name with kebab case
const migrationName = args[0].toLowerCase().replace(/\s+/g, '-');
const templateType = args[1] ? args[1].toLowerCase() : 'default';

// Generate timestamp (YYYYMMDDHHmmss format)
const now = new Date();
const timestamp = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
  String(now.getHours()).padStart(2, '0'),
  String(now.getMinutes()).padStart(2, '0'),
  String(now.getSeconds()).padStart(2, '0')
].join('');

// Create filename
const filename = `${timestamp}-${migrationName}.js`;
const filepath = path.join(__dirname, filename);

// Template functions
const templates = {
  default: () => `'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Implement your migration here
      // Example:
      // await queryInterface.addColumn('tableName', 'columnName', {
      //   type: Sequelize.STRING,
      //   allowNull: false,
      //   defaultValue: 'default'
      // });
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Implement the rollback logic here
      // Example:
      // await queryInterface.removeColumn('tableName', 'columnName');
    } catch (error) {
      console.error('Rollback migration failed:', error);
      throw error;
    }
  }
};`,

  'add-column': () => `'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // First check if column exists
      const tableDescription = await queryInterface.describeTable('tableName');
      
      if (!tableDescription.columnName) {
        // Add new column
        await queryInterface.addColumn('tableName', 'columnName', {
          type: Sequelize.STRING, // Change to appropriate type
          allowNull: true,
          defaultValue: null
        });
        console.log('Successfully added column to table');
      } else {
        console.log('Column already exists in table');
      }
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Check if column exists before removing
      const tableDescription = await queryInterface.describeTable('tableName');
      
      if (tableDescription.columnName) {
        // Remove column
        await queryInterface.removeColumn('tableName', 'columnName');
        console.log('Successfully removed column from table');
      }
    } catch (error) {
      console.error('Rollback migration failed:', error);
      throw error;
    }
  }
};`,

  'rename-column': () => `'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // First check if source column exists and target column doesn't
      const tableDescription = await queryInterface.describeTable('tableName');
      
      if (tableDescription.sourceColumn && !tableDescription.targetColumn) {
        // Rename column
        await queryInterface.renameColumn('tableName', 'sourceColumn', 'targetColumn');
        console.log('Successfully renamed column in table');
      } else if (!tableDescription.sourceColumn) {
        console.log('Source column does not exist in table');
      } else {
        console.log('Target column already exists in table');
      }
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Check if target column exists and source column doesn't
      const tableDescription = await queryInterface.describeTable('tableName');
      
      if (tableDescription.targetColumn && !tableDescription.sourceColumn) {
        // Rename back to original
        await queryInterface.renameColumn('tableName', 'targetColumn', 'sourceColumn');
        console.log('Successfully renamed column back in table');
      }
    } catch (error) {
      console.error('Rollback migration failed:', error);
      throw error;
    }
  }
};`,

  'create-table': () => `'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Check if table exists
      const tables = await queryInterface.showAllTables();
      
      if (!tables.includes('newTable')) {
        // Create new table
        await queryInterface.createTable('newTable', {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
          },
          name: {
            type: Sequelize.STRING,
            allowNull: false
          },
          description: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          }
        });
        console.log('Successfully created table');
      } else {
        console.log('Table already exists');
      }
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Drop the table
      await queryInterface.dropTable('newTable');
      console.log('Successfully dropped table');
    } catch (error) {
      console.error('Rollback migration failed:', error);
      throw error;
    }
  }
};`
};

// Select template based on type or use default
const templateFn = templates[templateType] || templates.default;
const template = templateFn();

// Write file
fs.writeFileSync(filepath, template);

console.log(`Migration file created: ${filename}`);
console.log(`Template used: ${templateType}`);
console.log(`Path: ${filepath}`);
