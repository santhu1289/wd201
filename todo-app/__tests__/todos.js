// const request = require("supertest");
// var cheerio = require("cheerio");

// const db = require("../models/index");
// const app = require("../app");

// let server, agent;
// function extractCsrfToken(res) {
//   var $ = cheerio.load(res.text);
//   return $("[name=_csrf]").val();
// }

// describe("Todo Application", function () {
//   beforeAll(async () => {
//     await db.sequelize.sync({ force: true });
//     server = app.listen(4000, () => {});
//     agent = request.agent(server);
//   });

//   afterAll(async () => {
//     try {
//       await db.sequelize.close();
//       await server.close();
//     } catch (error) {
//       console.log(error);
//     }
//   });

//   test("Creates a todo and responds with json at /todos POST endpoint", async () => {
//     const res = await agent.get("/");
//     const cserToken = extractCsrfToken(res);
//     const response = await agent.post("/todos").send({
//       title: "Buy milk",
//       dueDate: new Date().toISOString(),
//       completed: false,
//       _csrf: cserToken,
//     });
//     expect(response.statusCode).toBe(302);

//   });

//   test("Marks a todo with the given ID as complete", async () => {
//     let res = await agent.get("/");
//     let cserToken = extractCsrfToken(res);
//     await agent.post("/todos").send({
//       title: "Buy milk",
//       dueDate: new Date().toISOString(),
//       completed: false,
//       _csrf: cserToken,
//     });

//     const groupedTodoResponse = await agent
//       .get("/")
//       .set("Accept", "application/json");

//     const parsedGroupedResponse = JSON.parse(groupedTodoResponse.text);
//     const dueTodayCount = parsedGroupedResponse.dueTodayTodos.length;
//     const latestTodo = parsedGroupedResponse.dueTodayTodos[dueTodayCount - 1];

//     res = await agent.get("/");
//     csrfToken = extractCsrfToken(res);

//     const markCompletedResponse = await agent
//       .put(`/todos/${latestTodo.id}/markAsCompleted`)
//       .send({
//         _csrf: csrfToken,
//       });
//     const parseUpdateResponse = JSON.parse(markCompletedResponse.text);
//     expect(parseUpdateResponse.completed).toBe(true);
//   });

// });

const request = require("supertest");
var cheerio = require("cheerio");

const db = require("../models/index");
const app = require("../app");

let server, agent;
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Creates a todo and responds with json at /todos POST endpoint", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302); // Ensures successful creation
  });

  test("Marks a todo with the given ID as complete", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);

    // Create a new todo first
    const createResponse = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const createdTodo = JSON.parse(createResponse.text);

    // Now mark it as complete
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const markCompletedResponse = await agent
      .put(`/todos/${createdTodo.id}/markAsCompleted`)
      .send({ _csrf: csrfToken });

    console.log(
      "Mark Completed Response:",
      markCompletedResponse.status,
      markCompletedResponse.text
    ); // Log status and body

    const parseUpdateResponse = JSON.parse(markCompletedResponse.text);
    expect(parseUpdateResponse.completed).toBe(true); // Verifies completion
  });

  test("Marks a todo with the given ID as incomplete", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);

    // Create a new todo first
    const createResponse = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: true, // Start as completed
      _csrf: csrfToken,
    });

    const createdTodo = JSON.parse(createResponse.text);

    // Now mark it as incomplete
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const markIncompleteResponse = await agent
      .put(`/todos/${createdTodo.id}/markAsIncomplete`)
      .send({ _csrf: csrfToken });

    console.log(
      "Mark Incomplete Response:",
      markIncompleteResponse.status,
      markIncompleteResponse.text
    ); // Log status and body

    const parseUpdateResponse = JSON.parse(markIncompleteResponse.text);
    expect(parseUpdateResponse.completed).toBe(false); // Verifies incompletion
  });

  test("Deletes a todo with the given ID", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Clean the house",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const groupedTodoResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodoResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueTodayTodos.length;
    const latestTodo = parsedGroupedResponse.dueTodayTodos[dueTodayCount - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const deleteResponse = await agent
      .delete(`/todos/${latestTodo.id}`)
      .send({ _csrf: csrfToken });
    const parsedDeleteResponse = JSON.parse(deleteResponse.text);
    expect(parsedDeleteResponse.success).toBe(true); // Ensures deletion is successful
  });
});
