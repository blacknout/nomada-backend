'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('bikes', 'image');
    await queryInterface.addColumn('bikes', 'images', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: [],
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('bikes', 'image', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.removeColumn('bikes', 'images');
  }
};
