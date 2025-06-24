'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Check if GroupAdmins table exists
      const tables = await queryInterface.showAllTables();
      
      if (tables.includes('GroupAdmins')) {
        // First, check if there's any data we need to migrate
        const hasData = await queryInterface.sequelize.query(
          "SELECT COUNT(*) as count FROM \"GroupAdmins\"",
          { type: Sequelize.QueryTypes.SELECT }
        );
        
        if (hasData[0].count > 0) {
          console.log(`Found ${hasData[0].count} records in GroupAdmins table`);
          
          // Migrate data from GroupAdmins to group_admins if any exists
          await queryInterface.sequelize.query(`
            INSERT INTO group_admins (id, "groupId", "userId", "createdAt", "updatedAt")
            SELECT 
              "id", 
              "groupId", 
              "userId", 
              COALESCE("createdAt", CURRENT_TIMESTAMP),
              COALESCE("updatedAt", CURRENT_TIMESTAMP)
            FROM "GroupAdmins"
            ON CONFLICT (id) DO NOTHING
          `);
          
          console.log('Successfully migrated data from GroupAdmins to group_admins');
        }
        
        // Drop the GroupAdmins table
        await queryInterface.dropTable('GroupAdmins');
        console.log('Successfully dropped GroupAdmins table');
      } else {
        console.log('GroupAdmins table does not exist, nothing to drop');
      }
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Recreate GroupAdmins table if needed for rollback
      await queryInterface.createTable('GroupAdmins', {
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
      
      console.log('Successfully recreated GroupAdmins table for rollback');
    } catch (error) {
      console.error('Rollback migration failed:', error);
      throw error;
    }
  }
};