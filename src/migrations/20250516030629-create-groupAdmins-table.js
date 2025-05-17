'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Check if table exists
      const tables = await queryInterface.showAllTables();
      
      if (!tables.includes('group_admins')) {
        // Create new table
        await queryInterface.createTable('group_admins', {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
          },
          groupId: {
            type: Sequelize.UUID,
            references: { model: 'groups', key: 'id' },
            onDelete: 'CASCADE',
          },
          userId: {
            type: Sequelize.UUID,
            references: { model: 'users', key: 'id' },
            onDelete: 'CASCADE',
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
      await queryInterface.dropTable('group_admins');
      console.log('Successfully dropped table');
    } catch (error) {
      console.error('Rollback migration failed:', error);
      throw error;
    }
  }
};