'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Check if priority column already exists
      const tableDescription = await queryInterface.describeTable('notifications');
      
      if (!tableDescription.priority) {
        // Add priority column with default value 'normal'
        await queryInterface.addColumn('notifications', 'priority', {
          type: Sequelize.ENUM('low', 'medium', 'high'),
          defaultValue: 'low',
          allowNull: false
        });
        console.log('Successfully added priority column to notifications table');
      } else {
        console.log('priority column already exists in notifications table');
      }
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Check if priority column exists before removing
      const tableDescription = await queryInterface.describeTable('notifications');
      
      if (tableDescription.priority) {
        // Remove priority column
        await queryInterface.removeColumn('notifications', 'priority');
        console.log('Successfully removed priority column from notifications table');
      }
    } catch (error) {
      console.error('Rollback migration failed:', error);
      throw error;
    }
  }
};
