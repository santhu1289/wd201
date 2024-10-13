const { sequelize } = require("./connectDB"); // Import the sequelize instance
const Todo = require("./TodoModel.js");

const createTodo = async () => {
  try {
    await sequelize.authenticate(); // Use sequelize to connect
    const todo = await Todo.addTask({
      title: "Second Item",
      dueDate: new Date(),
      completed: false,
    });
    console.log(`Created to-do with ID ${todo.id}`);
  } catch (error) {
    console.error("Error creating todo:", error);
  }
};

const countItems = async () => {
  try {
    const totalCount = await Todo.count();
    console.log(`Found ${totalCount} items in the Table`);
  } catch (error) {
    console.error(error);
  }
};

const getAllTodos = async () => {
  try {
    const todos = await Todo.findAll();
    const todoList = todos.map((todo) => todo.displayableString()).join("\n");
    console.log(todoList);
  } catch (error) {
    console.error(error);
  }
};

const getSingleTodos = async () => {
  try {
    const todo = await Todo.findOne({
      where: {
        completed: false,
      },
      order: [["id", "DESC"]],
    });

    console.log(todo.displayableString());
  } catch (error) {
    console.error(error);
  }
};

const updateItem = async (id) => {
  try {
    await Todo.update(
      { completed: true },
      {
        where: {
          id: id,
        },
      }
    );
  } catch (error) {
    console.error(error);
  }
};

const deleteItem = async (id) => {
  try {
    const deleteRowCount = await Todo.destroy({
      where: {
        id: id,
      },
    });
    console.log(`Deleted ${deleteRowCount} rows!`);
  } catch (error) {
    console.error(error);
  }
};
// Immediately invoked function to create the todo
(async () => {
  //await createTodo();
  //await countItems();
  await getAllTodos();
  await deleteItem(2);
  await getAllTodos();
})();
