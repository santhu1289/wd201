"use strict";

const { sequelize } = require("../models");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Todos", "userId", {
      type: Sequelize.DataTypes.INTEGER,
    });

    await queryInterface.addConstraint("Todos", {
      fields: ["userId"],
      type: "foreign key",
      references: {
        table: "Users", // Ensure this matches the name of your user table
        field: "id", // Ensure this matches the primary key in your Users table
      },
    });
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Todos", "userId"); // Then remove the column
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
