// models/todo.js
'use strict'
const { Op } = require('sequelize')
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static async addTask(params) {
      return await Todo.create({
        ...params,
        completed: params.completed || false, // Default to false if not provided
      })
    }

    static async showList() {
      console.log('My Todo list \n')

      console.log('Overdue')
      const overdueTasks = await this.overdue()
      overdueTasks.forEach((task) => console.log(task.displayableString()))
      console.log('\n')

      console.log('Due Today')
      const todayTasks = await this.dueToday()
      todayTasks.forEach((task) => console.log(task.displayableString()))
      console.log('\n')

      console.log('Due Later')
      const laterTasks = await this.dueLater()
      laterTasks.forEach((task) => console.log(task.displayableString()))
    }

    static async overdue() {
      const today = new Date().toISOString().split('T')[0]
      return await Todo.findAll({
        where: {
          dueDate: { [Op.lt]: today },
          completed: false, // Change to true to fetch completed tasks
        },
      })
    }

    static async dueToday() {
      const today = new Date().toISOString().split('T')[0]
      return await Todo.findAll({
        where: {
          dueDate: today,
          completed: false,
        },
      })
    }

    static async dueLater() {
      const today = new Date().toISOString().split('T')[0]
      return await Todo.findAll({
        where: {
          dueDate: { [Op.gt]: today },
          completed: false,
        },
      })
    }

    static async markAsComplete(id) {
      const todo = await Todo.findByPk(id)
      if (todo) {
        console.log('Before marking complete:', todo)
        todo.completed = true
        await todo.save()
        console.log('After marking complete:', todo)
      }
    }

    displayableString() {
      const checkbox = this.completed ? '[x]' : '[ ]'
      const today = new Date().toISOString().split('T')[0]

      // If the task is due today, do not display the dueDate
      if (this.dueDate === today) {
        return `${this.id}. ${checkbox} ${this.title}`
      }

      // For overdue and future tasks, display the date
      return `${this.id}. ${checkbox} ${this.title} ${this.dueDate}`
    }
  }

  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Set default value to false
      },
    },
    {
      sequelize,
      modelName: 'Todo',
    },
  )

  return Todo
}
