'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // First check if isRead column exists
      const tableDescription = await queryInterface.describeTable('notifications');
      
      if (tableDescription.isRead && !tableDescription.read) {
        // Rename isRead to read
        await queryInterface.renameColumn('notifications', 'isRead', 'read');
        console.log('Successfully renamed isRead column to read in notifications table');
      } else if (!tableDescription.isRead && !tableDescription.read) {
        // If neither column exists, add the read column
        await queryInterface.addColumn('notifications', 'read', {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false
        });
        console.log('Added new read column to notifications table');
      } else {
        console.log('read column already exists in notifications table');
      }
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Check if read column exists
      const tableDescription = await queryInterface.describeTable('notifications');
      
      if (tableDescription.read && !tableDescription.isRead) {
        // Rename read back to isRead
        await queryInterface.renameColumn('notifications', 'read', 'isRead');
        console.log('Successfully renamed read column back to isRead in notifications table');
      }
    } catch (error) {
      console.error('Rollback migration failed:', error);
      throw error;
    }
  }
};
