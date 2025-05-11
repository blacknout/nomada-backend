'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('users');
    if (!tableDescription.pushToken) {
      await queryInterface.addColumn('users', 'pushToken', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'pushToken');

  }
};
