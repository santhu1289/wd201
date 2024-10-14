const express = require("express");
const app = express();
const { Todo } = require("./models");
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form submissions

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// GET / - Render the main page with categorized todos
app.get("/", async (request, response) => {
  try {
    const allTodos = await Todo.getTodos();
    const currentDate = new Date();

    // Categorizing todos
    const overdueTodos = allTodos.filter(
      (todo) => new Date(todo.dueDate) < currentDate && !todo.completed
    );
    const dueTodayTodos = allTodos.filter(
      (todo) =>
        new Date(todo.dueDate).toDateString() === currentDate.toDateString() &&
        !todo.completed
    );
    const dueLaterTodos = allTodos.filter(
      (todo) => new Date(todo.dueDate) > currentDate && !todo.completed
    );

    // Render the view
    response.render("index", {
      allTodos,
      overdueTodos,
      dueTodayTodos,
      dueLaterTodos,
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to load todos" });
  }
});

// GET /todos - Fetch all To-Dos from the database
app.get("/todos", async function (_request, response) {
  console.log("Processing list of all Todos ...");
  try {
    const todos = await Todo.findAll(); // Fetch all To-Dos
    return response.json(todos); // Send back the list as JSON
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Failed to fetch todos" });
  }
});

// POST /todos - Create a new To-Do
app.post("/todos", async function (request, response) {
  try {
    const todo = await Todo.addTodo(request.body);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json({ error: "Failed to create todo" });
  }
});

// PUT /todos/:id/markAsCompleted - Mark a To-Do as completed
app.put("/todos/:id/markAsCompleted", async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response
      .status(422)
      .json({ error: "Failed to mark todo as completed" });
  }
});

// DELETE /todos/:id - Delete a To-Do by ID
app.delete("/todos/:id", async function (request, response) {
  const todoID = request.params.id;
  try {
    const todo = await Todo.findByPk(todoID); // Find the todo by ID
    if (!todo) {
      return response.status(404).send(false); // If the todo doesn't exist, return 404 with false
    }
    await todo.destroy(); // Delete the todo
    return response.status(200).send(true); // Return true if deletion was successful
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Something went wrong!" }); // Handle server error
  }
});

module.exports = app;
