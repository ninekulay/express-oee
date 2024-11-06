'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create table first (if not created in a prior migration)
    await queryInterface.createTable('relation_machine_users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      machine_id: {
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
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

    // Add foreign key constraints
    await queryInterface.addConstraint('relation_machine_users', {
      fields: ['machine_id'],
      type: 'foreign key',
      name: 'fk_machine_id', // optional: constraint name
      references: {
        table: 'machine_statuses', // make sure this is the correct table name
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('relation_machine_users', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_user_id', // optional: constraint name
      references: {
        table: 'user_managements', // make sure this is the correct table name
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove constraints first
    await queryInterface.removeConstraint('relation_machine_users', 'fk_machine_id');
    await queryInterface.removeConstraint('relation_machine_users', 'fk_user_id');

    // Drop the table
    await queryInterface.dropTable('relation_machine_users');
  }
};
