const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
//app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/todos", (request, response) => {
  //response.send("hello World");
  console.log("Todo Lsit");
});

app.post("/todos", async (request, response) => {
  console.log("creating a Todo", request.body);
  //Todo
  try {
    const todo = await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      completed: false,

      //const todo = await Todo.addTodo(request.body);
    });

    return response.json(todo);
  } catch (error) {
    console.error(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async (request, response) => {
  console.log("We have to updateto todo with ID: ", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updateTodo = await todo.markAsCompleted();
    return response.json(updateTodo);
  } catch (error) {
    console.error(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", (request, response) => {
  console.log("Delete a todo by ID: ", request.params.id);
});

module.exports = app;
