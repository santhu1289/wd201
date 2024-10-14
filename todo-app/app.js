const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");
app.use(bodyParser.json());

app.set("view engine", "ejs");

app.get("/", async (request, response) => {
  const allTodos = await Todo.getTodos();
  if (request.accepts("html")) {
    response.render("index", {
      allTodos,
    });
  } else {
    response.json("index", {
      allTodos,
    });
  }
});

app.use(express.static(path.join(__dirname, "public")));

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

// GET /todos/:id - Fetch a single To-Do by ID
app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

// POST /todos - Create a new To-Do
app.post("/todos", async function (request, response) {
  try {
    const todo = await Todo.addTodo(request.body);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

// PUT /todos/:id/markAsCompleted - Mark a To-Do as completed
app.put("/todos/:id/markAsCompleted", async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

// DELETE /todos/:id - Delete a To-Do by ID
// app.delete("/todos/:id", async (request, response) => {
//   const todoId = request.params.id;
//   try {
//     const todo = await Todo.findByPk(todoId);
//     if (!todo) {
//       return response.status(404).json({ error: "Todo not found" });
//     }

//     await todo.destroy(); // Deletes the todo from the database
//     return response.json(true); // Return true as a JSON response
//     //return response.send(deleted ? true:false);
//   } catch (error) {
//     console.log(error);
//     return response.status(500).json({ error: "Failed to delete todo" });
//   }
// });

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