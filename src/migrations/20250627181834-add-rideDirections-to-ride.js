'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('rides');
    if (!tableDescription.rideDirections) {
      await queryInterface.addColumn('rides', 'rideDirections', {
        type: Sequelize.JSONB,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('rides', 'rideDirections');
  },
};
