'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('sos');
    if (!tableDescription.contactName) {
      await queryInterface.addColumn('sos', 'contactName', {
        type: Sequelize.STRING,
      });
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('sos', 'contactName');

  }
};
