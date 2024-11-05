'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('machine_statuses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      machine_name: {
        type: Sequelize.STRING
      },
      friendly_machine_name: {
        type: Sequelize.STRING
      },
      line_name: {
        type: Sequelize.STRING
      },
      friendly_name: {
        type: Sequelize.STRING
      },
      location: {
        type: Sequelize.STRING
      },
      friendly_location_name: {
        type: Sequelize.STRING
      },
      machine_status: {
        allowNull: false,
        type: Sequelize.STRING
      },
      operate_data: {
        type: Sequelize.JSON,
        allowNull: true, // Allow null values
      },
      production_setting: {
        allowNull: true,
        type: Sequelize.JSON
      },
      notification_setting: {
        allowNull: true,
        type: Sequelize.JSON
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('machine_statuses');
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
