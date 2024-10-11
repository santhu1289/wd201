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
          completed: false,
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
      const isDueToday = this.dueDate === moment().format('YYYY-MM-DD')
      const showDate = this.completed || !isDueToday ? this.dueDate : '' // Always show date if completed, even if overdue
      return `${this.id}. ${checkbox} ${this.title.trim()} ${showDate}`
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
