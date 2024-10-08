const todoList = () => {
  const all = []

  const formattedDate = (date) => {
    return date.toISOString().split('T')[0] // Returns the date in 'YYYY-MM-DD' format
  }

  const add = (todoItem) => {
    all.push(todoItem)
  }

  const markAsComplete = (index) => {
    all[index].completed = true
  }

  const overdue = () => {
    const today = formattedDate(new Date())
    return all.filter((todo) => todo.dueDate < today)
  }

  const dueToday = () => {
    const today = formattedDate(new Date())
    return all.filter((todo) => todo.dueDate === today)
  }

  const dueLater = () => {
    const today = formattedDate(new Date())
    return all.filter((todo) => todo.dueDate > today)
  }

  const toDisplayableList = (list) => {
    return list
      .map((todo) => {
        const checkbox = todo.completed ? '[x]' : '[ ]'
        const datePart =
          todo.dueDate === formattedDate(new Date()) ? '' : ` ${todo.dueDate}`
        return `${checkbox} ${todo.title}${datePart}`
      })
      .join('\n')
  }

  return {
    all,
    add,
    markAsComplete,
    overdue,
    dueToday,
    dueLater,
    toDisplayableList,
  }
}

// ####################################### #
// DO NOT CHANGE ANYTHING BELOW THIS LINE. #
// ####################################### #

module.exports = todoList
