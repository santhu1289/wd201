const express = require("express");
var csrf = require("tiny-csrf");
const app = express();
const { Todo, User } = require("./models");
const path = require("path");
var cookieParser = require("cookie-parser");

const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const flash = require("connect-flash");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

const saltRound = 10;
// const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.use(flash());
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
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async (user) => {
          if (!user) {
            return done(null, false, { message: "No user with that email" });
          }

          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid password" });
          }
        })
        .catch((err) => {
          return done(err);
        });
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
      console.log(request.user.id);
      const loggedInUser = request.user.id;
      const overdueTodos = await Todo.overdueTodos(loggedInUser);
      const dueLaterTodos = await Todo.dueLaterTodos(loggedInUser);
      const dueTodayTodos = await Todo.dueTodayTodos(loggedInUser);
      const completedTodos = await Todo.completedTodos(loggedInUser);
      // console.log(overdueTodos, dueTodayTodos, dueLaterTodos, completedTodos);

      // Check if todos are properly fetched
      if (request.accepts("html")) {
        response.render("todos", {
          title: "Your Todos",
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

app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

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
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (request, response) {
    console.log(request.user);
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
  const { firstName, email, password } = request.body;

  // Validate inputs
  if (!firstName || !email) {
    request.flash("error", "First name and email are required.");
    return response.redirect("/signup"); // Redirect back to signup
  }

  const hashedPwd = await bcrypt.hash(password, saltRound);
  try {
    const user = await User.create({
      firstName,
      lastName: request.body.lastName, // optional
      email,
      password: hashedPwd,
    });
    request.login(user, (err) => {
      if (err) {
        console.error(err);
        return response.redirect("/signup"); // Redirect back to signup
      }
      response.redirect("/todos");
    });
  } catch (error) {
    console.error(error);
    request.flash("error", "Failed to create user."); // Error message
    response.redirect("/signup"); // Redirect back to signup
  }
});

// POST /todos - Create a new To-Do
app.post(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const { title, dueDate } = request.body;

    // Validate inputs
    if (!title || !dueDate) {
      request.flash("error", "Both title and due date are required.");
      return response.redirect("/todos"); // Redirect back to the todos page
    }

    try {
      await Todo.addTodo({
        title,
        dueDate,
        userId: request.user.id,
      });
      request.flash("success", "Todo created successfully!"); // Success message
      response.redirect("/todos");
    } catch (error) {
      console.log(error);
      request.flash("error", "Failed to create todo."); // Error message
      response.redirect("/todos"); // Redirect back to the todos page
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
      const result = await Todo.remove(request.params.id, request.user.id); // Pass user ID
      if (!result)
        return response.status(404).json({
          error:
            "Todo not found or you do not have permission to delete this todo",
        });
      return response.json({ success: true });
    } catch (error) {
      console.error("Error deleting todo:", error);
      return response.status(422).json({ error: "Failed to delete todo" });
    }
  }
);

module.exports = app;
