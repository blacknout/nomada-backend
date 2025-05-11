'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('bikes');
    if (!tableDescription.stolen) {
      await queryInterface.addColumn('bikes', 'stolen', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      });
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('bikes', 'stolen');
  }
};
