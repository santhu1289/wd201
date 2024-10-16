const express = require("express");
var csrf = require("tiny-csrf");
const app = express();
const { Todo } = require("./models");
const path = require("path");
var cookieParser = require("cookie-parser");
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // For form submissions
app.use(cookieParser("shh! some secrate string"));
app.use(csrf("This_Shoul_be_32_Characters_long", ["POST", "PUT", "DELETE"]));
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
    const completedTodos = allTodos.filter((todo) => todo.completed);
    // Render the view based on the Accept header
    if (request.accepts("html")) {
      response.render("index", {
        allTodos,
        overdueTodos,
        dueTodayTodos,
        dueLaterTodos,
        completedTodos,
        csrfToken: request.csrfToken(),
      });
    } else {
      // Handle JSON response for API requests
      response.json({
        overdueTodos,
        dueTodayTodos,
        dueLaterTodos,
        completedTodos,
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
app.put("/todos/:id/markAsCompleted", async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    todo.completed = true; // Set completed to true
    await todo.save();
    return res.json(todo); // Send back the updated todo as JSON
  } catch (error) {
    return res.status(500).json({ error: "Failed to update todo" });
  }
});

app.put("/todos/:id/markAsIncomplete", async (req, res) => {
  try {
    const todo = await Todo.findByPk(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    todo.completed = false; // Set completed to false
    await todo.save();
    return res.json(todo); // Send back the updated todo as JSON
  } catch (error) {
    return res.status(500).json({ error: "Failed to update todo" });
  }
});

// router.put("/todos/:id", async (req, res) => {
//   const id = req.params.id;
//   const { completed } = req.body;

//   try {
//     await Todo.setCompletionStatus(id, completed);
//     res.status(200).json({ message: "Todo updated successfully" });
//   } catch (err) {
//     res.status(500).json({ error: "Unable to update todo" });
//   }
// });

// router.delete("/todos/:id", async (req, res) => {
//   const id = req.params.id;
//   try {
//     const todo = await Todo.findByPk(id);
//     if (todo) {
//       await todo.destroy();
//       res.status(200).json({ message: "Todo deleted successfully" });
//     } else {
//       res.status(404).json({ error: "Todo not found" });
//     }
//   } catch (err) {
//     res.status(500).json({ error: "Unable to delete todo" });
//   }
// });

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
