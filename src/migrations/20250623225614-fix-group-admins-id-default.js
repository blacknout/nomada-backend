'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Add default UUID generation to the id column
      await queryInterface.changeColumn('group_admins', 'id', {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      });
      
      console.log('Successfully added UUID default to group_admins.id column');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Remove the default value
      await queryInterface.changeColumn('group_admins', 'id', {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      });
      
      console.log('Successfully removed UUID default from group_admins.id column');
    } catch (error) {
      console.error('Rollback migration failed:', error);
      throw error;
    }
  }
}; 