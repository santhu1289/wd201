"use strict";
const { Model, Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
      // Define association here
      Todo.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }

    static addTodo({ title, dueDate, userId }) {
      return this.create({
        title,
        dueDate,
        completed: false,
        userId, // Corrected from useId to userId
      });
    }

    static async overdueTodos(userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date(),
          },
          userId,
          completed: false,
        },
      });
    }

    static async dueLaterTodos(userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date(),
          },
          userId,
          completed: false,
        },
      });
    }

    static async dueTodayTodos(userId) {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      return this.findAll({
        where: {
          dueDate: {
            [Op.eq]: currentDate,
          },
          userId,
          completed: false,
        },
      });
    }

    static async completedTodos(userId) {
      return this.findAll({
        where: {
          completed: true,
          userId,
        },
      });
    }

    static async remove(id, userId) {
      return this.destroy({
        where: {
          id,
          userId,
        },
      });
    }
  }

  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Title cannot be null.",
          },
          notEmpty: {
            msg: "Title cannot be empty.",
          },
          len: {
            args: [5, 255], // Minimum of 5 and maximum of 255 characters
            msg: "Title must be between 5 and 255 characters long.",
          },
        },
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false, // Ensure that dueDate cannot be null
        validate: {
          isDate: {
            msg: "Must be a valid date.",
          },
          notNull: {
            msg: "Due date cannot be null.",
          },
        },
      },
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Default value for completed
      },
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );

  return Todo;
};
