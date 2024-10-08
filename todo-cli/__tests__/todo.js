const todoList = require('../todo')

const { all, markAsComplete, add, overdue, dueToday, dueLater } = todoList()

describe('TodoList Test Suites', () => {
  beforeEach(() => {
    // Clear the todo list before each test
    all.length = 0 // Reset the todo list
  })

  test('Should add new todo', () => {
    expect(all.length).toBe(0)
    add({
      title: 'Test todo',
      completed: false,
      dueDate: new Date().toISOString().split('T')[0], // Use only the date part
    })
    expect(all.length).toBe(1)
    expect(all[0].title).toBe('Test todo')
  })

  test('should mark a todo as complete', () => {
    add({
      title: 'Test todo',
      completed: false,
      dueDate: new Date().toISOString().split('T')[0],
    })
    expect(all[0].completed).toBe(false)
    markAsComplete(0)
    expect(all[0].completed).toBe(true)
  })

  test('should retrieve overdue items', () => {
    const overdueTodo = {
      title: 'Overdue todo',
      completed: false,
      dueDate: new Date(new Date().setDate(new Date().getDate() - 1))
        .toISOString()
        .split('T')[0],
    }
    const dueTodayTodo = {
      title: 'Due today todo',
      completed: false,
      dueDate: new Date().toISOString().split('T')[0],
    }
    add(overdueTodo)
    add(dueTodayTodo)

    const overdueItems = overdue()
    expect(overdueItems.length).toBe(1)
    expect(overdueItems[0].title).toBe('Overdue todo')
  })

  test('should retrieve due today items', () => {
    const overdueTodo = {
      title: 'Overdue todo',
      completed: false,
      dueDate: new Date(new Date().setDate(new Date().getDate() - 1))
        .toISOString()
        .split('T')[0],
    }
    const dueTodayTodo = {
      title: 'Due today todo',
      completed: false,
      dueDate: new Date().toISOString().split('T')[0],
    }
    add(overdueTodo)
    add(dueTodayTodo)

    const dueTodayItems = dueToday()
    expect(dueTodayItems.length).toBe(1)
    expect(dueTodayItems[0].title).toBe('Due today todo')
  })

  test('should retrieve due later items', () => {
    const overdueTodo = {
      title: 'Overdue todo',
      completed: false,
      dueDate: new Date(new Date().setDate(new Date().getDate() - 1))
        .toISOString()
        .split('T')[0],
    }
    const dueTodayTodo = {
      title: 'Due today todo',
      completed: false,
      dueDate: new Date().toISOString().split('T')[0],
    }
    const futureTodo = {
      title: 'Future todo',
      completed: false,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 1))
        .toISOString()
        .split('T')[0],
    }
    add(overdueTodo)
    add(dueTodayTodo)
    add(futureTodo)

    const dueLaterItems = dueLater()
    expect(dueLaterItems.length).toBe(1)
    expect(dueLaterItems[0].title).toBe('Future todo')
  })
})
