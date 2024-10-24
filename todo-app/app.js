const express = require("express");
var csrf = require("tiny-csrf");
const app = express();
const { Todo, User } = require("./models");
const path = require("path");
var cookieParser = require("cookie-parser");

const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

const saltRound = 10;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(csrf("A_very_secure_secret_of_32_char_", ["POST", "PUT", "DELETE"]));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "my-super-secret-key-1234345334556677",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24hrs
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (username, password, done) => {
      try {
        const user = await User.findOne({ where: { email: username } });
        if (!user) return done(null, false, { message: "Invalid email" });

        const result = await bcrypt.compare(password, user.password);
        if (result) return done(null, user);
        else return done(null, false, { message: "Invalid Password" });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

// Routes
app.get("/", async (request, response) => {
  response.render("index", {
    title: "Todo Application",
    csrfToken: request.csrfToken(),
  });
});

app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const loggedInUser = request.user.id;
      const overdueTodos = await Todo.overdueTodos(loggedInUser);
      const dueLaterTodos = await Todo.dueLaterTodos(loggedInUser);
      const dueTodayTodos = await Todo.dueTodayTodos(loggedInUser);
      const completedTodos = await Todo.completedTodos(loggedInUser);

      // Log the results to check if the data is fetched correctly
      console.log("Overdue Todos:", overdueTodos);
      console.log("Due Later Todos:", dueLaterTodos);
      console.log("Due Today Todos:", dueTodayTodos);
      console.log("Completed Todos:", completedTodos);

      if (request.accepts("html")) {
        response.render("todos", {
          overdueTodos,
          dueTodayTodos,
          dueLaterTodos,
          completedTodos,
          csrfToken: request.csrfToken(),
        });
      } else {
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
  }
);

app.get("/signup", (request, response) => {
  response.render("signup", {
    title: "Signup",
    csrfToken: request.csrfToken(),
  });
});

app.get("/login", (request, response) => {
  response.render("login", { title: "Login", csrfToken: request.csrfToken() });
});

app.post(
  "/session",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (request, response) => {
    response.redirect("/todos");
  }
);

app.get("/signout", (request, response, next) => {
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});

app.post("/users", async (request, response) => {
  const hashedPwd = await bcrypt.hash(request.body.password, saltRound);
  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: hashedPwd,
    });
    request.login(user, (err) => {
      if (err) {
        console.error(err);
      }
      response.redirect("/todos");
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to create user" });
  }
});

// POST /todos - Create a new To-Do
app.post(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      await Todo.addTodo({
        title: request.body.title,
        dueDate: request.body.dueDate,
        userId: request.user.id,
      });
      response.redirect("/todos");
    } catch (error) {
      console.log(error);
      response.status(422).json({ error: "Failed to create todo" });
    }
  }
);

// PUT /todos/:id/markAsCompleted
app.put(
  "/todos/:id/markAsCompleted",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const todo = await Todo.findByPk(req.params.id);
      if (!todo) return res.status(404).json({ error: "Todo not found" });
      todo.completed = true;
      await todo.save();
      return res.json(todo);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update todo" });
    }
  }
);

// DELETE /todos/:id - Delete a To-Do by ID
app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const result = await Todo.remove(request.params.id);
      if (!result)
        return response.status(404).json({ error: "Todo not found" });
      return response.json({ success: true });
    } catch (error) {
      console.error("Error deleting todo:", error);
      return response.status(422).json({ error: "Failed to delete todo" });
    }
  }
);

module.exports = app;
