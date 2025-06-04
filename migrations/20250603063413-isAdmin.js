'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'isadmin'); // Ensure 'users' matches your actual table name (case-sensitive)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'isadmin', { // Re-add the column if you rollback
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      // Add other original attributes if necessary (allowNull, etc.)
    });
  }
};