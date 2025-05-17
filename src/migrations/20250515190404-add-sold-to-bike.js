'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // First check if column exists
      const tableDescription = await queryInterface.describeTable('bikes');
      
      if (!tableDescription.sold) {
        // Add new column
        await queryInterface.addColumn('bikes', 'sold', {
          type: Sequelize.BOOLEAN,
          defaultValue: false
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
      const tableDescription = await queryInterface.describeTable('bikes');
      
      if (tableDescription.sold) {
        // Remove column
        await queryInterface.removeColumn('bikes', 'sold');
        console.log('Successfully removed column from table');
      }
    } catch (error) {
      console.error('Rollback migration failed:', error);
      throw error;
    }
  }
};