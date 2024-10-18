const express = require("express");
const app = express();
const { Todo } = require("./models");
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({ extended: false })); // For form submissions

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (request, response) => {
  try {
    const allTodos = await Todo.getTodos();
    const currentDate = new Date();

    currentDate.setHours(0, 0, 0, 0); // This ensures we're only comparing the dates, not the time

    // Categorizing todos
    const overdueTodos = allTodos.filter((todo) => {
      const dueDate = new Date(todo.dueDate);
      dueDate.setHours(0, 0, 0, 0); // Normalize the dueDate to midnight for comparison

      return dueDate < currentDate && !todo.completed;
    });

    const dueTodayTodos = allTodos.filter((todo) => {
      const dueDate = new Date(todo.dueDate);
      dueDate.setHours(0, 0, 0, 0); // Normalize the dueDate to midnight for comparison

      return dueDate.getTime() === currentDate.getTime() && !todo.completed;
    });

    const dueLaterTodos = allTodos.filter((todo) => {
      const dueDate = new Date(todo.dueDate);
      dueDate.setHours(0, 0, 0, 0); // Normalize the dueDate to midnight for comparison

      return dueDate > currentDate && !todo.completed;
    });

    // Render the view based on the Accept header
    if (request.accepts("html")) {
      response.render("index", {
        allTodos,
        overdueTodos,
        dueTodayTodos,
        dueLaterTodos,
      });
    } else {
      // Handle JSON response for API requests
      response.json({
        overdueTodos,
        dueTodayTodos,
        dueLaterTodos,
      });
    }
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
    return response.redirect("/");
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
app.delete("/todos/:id", async (request, response) => {
  console.log("Deleting Todo with ID:", request.params.id);
  try {
    const result = await Todo.remove(request.params.id); // Ensure the `remove` function is implemented correctly
    if (!result) {
      return response.status(404).json({ error: "Todo not found" });
    }
    return response.json({ success: true });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return response.status(422).json({ error: "Failed to delete todo" });
  }
});

module.exports = app;
