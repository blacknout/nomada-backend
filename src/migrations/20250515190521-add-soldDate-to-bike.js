'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // First check if column exists
      const tableDescription = await queryInterface.describeTable('bikes');
      
      if (!tableDescription.soldDate) {
        // Add new column
        await queryInterface.addColumn('bikes', 'soldDate', {
          type: Sequelize.DATE,
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
      const tableDescription = await queryInterface.describeTable('bikes');
      
      if (tableDescription.soldDate) {
        // Remove column
        await queryInterface.removeColumn('bikes', 'soldDate');
        console.log('Successfully removed column from table');
      }
    } catch (error) {
      console.error('Rollback migration failed:', error);
      throw error;
    }
  }
};