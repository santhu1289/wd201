// models/todo.js
'use strict'
const { Model, Op } = require('sequelize')
const moment = require('moment')

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    // Add a new task to the todo list
    static async addTask(params) {
      return await Todo.create(params)
    }

    // Show the entire list in the required format
    static async showList() {
      console.log('My Todo-list\n')

      console.log('Overdue')
      const overdueTasks = await Todo.overdue()
      overdueTasks.forEach((task) => console.log(task.displayableString()))
      console.log('\n')

      console.log('Due Today')
      const todayTasks = await Todo.dueToday()
      todayTasks.forEach((task) => console.log(task.displayableString()))
      console.log('\n')

      console.log('Due Later')
      const laterTasks = await Todo.dueLater()
      laterTasks.forEach((task) => console.log(task.displayableString()))
    }

    // Get overdue tasks (tasks whose due date is before today and are not completed)
    static async overdue() {
      const today = moment().format('YYYY-MM-DD')
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.lt]: today,
          },
          completed: false,
        },
      })
    }

    // Get tasks that are due today
    static async dueToday() {
      const today = moment().format('YYYY-MM-DD')
      return await Todo.findAll({
        where: {
          dueDate: today,
        },
      })
    }

    // Get tasks that are due later (tasks whose due date is after today)
    static async dueLater() {
      const today = moment().format('YYYY-MM-DD')
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.gt]: today,
          },
        },
      })
    }

    // Mark a task as completed
    static async markAsComplete(id) {
      const task = await Todo.findByPk(id)
      if (task) {
        task.completed = true
        await task.save()
      }
    }

    // Convert task into a displayable string
    displayableString() {
      const checkbox = this.completed ? '[x]' : '[ ]'
      const formattedDate =
        this.dueDate === moment().format('YYYY-MM-DD') ? '' : this.dueDate
      return `${this.id}. ${checkbox} ${this.title.trim()} ${formattedDate}`
    }
  }

  // Define the model's schema
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'Todo',
    },
  )

  return Todo
}
