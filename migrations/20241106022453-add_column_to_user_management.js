'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_managements', 'failed_login', {
      type: Sequelize.INTEGER, // Corrected to INTEGER
      allowNull: true,          // Set to `false` if the column should not allow nulls
      defaultValue: 0           // Optional default value
    });
    await queryInterface.addColumn('user_managements', 'account_locked_until', {
      type: Sequelize.DATE,     // Set to `DATE` type for timestamps
      allowNull: true           // Set to `false` if it should not allow nulls
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('user_managements', 'failed_login');
    await queryInterface.removeColumn('user_managements', 'account_locked_until');
  }
};
