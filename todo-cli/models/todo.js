// models/todo.js
'use strict'
const { Model, Op } = require('sequelize')
const moment = require('moment')

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static async addTask(params) {
      return await Todo.create(params)
    }

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

    static async overdue() {
      const today = moment().format('YYYY-MM-DD')
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.lt]: today,
          },
        },
      })
    }

    static async dueToday() {
      const today = moment().format('YYYY-MM-DD')
      return await Todo.findAll({
        where: {
          dueDate: today,
        },
      })
    }

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

    static async markAsComplete(id) {
      const task = await Todo.findByPk(id)
      if (task) {
        task.completed = true
        await task.save()
      }
    }

    displayableString() {
      const checkbox = this.completed ? '[x]' : '[ ]'
      const today = moment().format('YYYY-MM-DD')

      // For past-due and completed tasks, always show the due date
      if (this.completed && this.dueDate < today) {
        return `${this.id}. ${checkbox} ${this.title.trim()} ${this.dueDate}`
      }

      // For tasks due today (both completed and incomplete), do not show the due date
      if (this.dueDate === today) {
        return `${this.id}. ${checkbox} ${this.title.trim()}`
      }

      // For incomplete tasks due later, show the due date
      return `${this.id}. ${checkbox} ${this.title.trim()} ${this.dueDate}`
    }
  }

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
