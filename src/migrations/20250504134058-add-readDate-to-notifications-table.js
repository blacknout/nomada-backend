'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('notifications');
    if (!tableDescription.readDate) {
      await queryInterface.addColumn('notifications', 'readDate', {
        type: Sequelize.DATE,
        allowNull: true, // optional
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('notifications', 'readDate');
  },
};
