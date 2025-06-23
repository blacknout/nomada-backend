'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // First ensure the uuid-ossp extension is available
      await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
      
      // Set default value for id column using PostgreSQL's gen_random_uuid()
      await queryInterface.sequelize.query(`
        ALTER TABLE group_admins 
        ALTER COLUMN id SET DEFAULT gen_random_uuid();
      `);
      
      console.log('Successfully set UUID default for group_admins.id column');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Remove the default value
      await queryInterface.sequelize.query(`
        ALTER TABLE group_admins 
        ALTER COLUMN id DROP DEFAULT;
      `);
      
      console.log('Successfully removed UUID default from group_admins.id column');
    } catch (error) {
      console.error('Rollback migration failed:', error);
      throw error;
    }
  }
}; 