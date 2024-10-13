const request = require("supertest");
const db = require("../models/index.js");
const app = require("../app");
const { password } = require("pg/lib/defaults.js");

let server, agent;

describe("Todo Test Suite", () => {
  // Before all tests, sync the database and start the server
  beforeAll(async () => {
    await db.sequelize.sync({ force: true }); // Reset the database before tests
    server = app.listen(3000, () => {}); // Start the server
    agent = request.agent(server); // Create an agent for requests
  });

  // After all tests, close the database connection and server
  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  // Test the POST /todos endpoint
  test("responds with JSON and creates a Todo", async () => {
    // Send a POST request to create a new todo
    const response = await agent.post("/todos").send({
      title: "Buy Milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });

    // Check if the status code is 200 (OK)
    expect(response.statusCode).toBe(200);

    // Check if the response is JSON
    expect(response.header["content-type"]).toBe(
      "application/json; charset=utf-8"
    );

    // Parse the response body as JSON and check if 'id' is defined
    const parseResponse = JSON.parse(response.text);
    expect(parseResponse.id).toBeDefined();
  });

  test("Mark a todo as Complete", async () => {
    const response = await agent.post("/todos").send({
      title: "buy Milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    const parseResponse = JSON.parse(response.text);
    const todoID = parseResponse.id;

    expect(parseResponse.completed).toBe(false);

    const markCompletedResponse = await agent
      .put(`/todos/${todoID}/markAsCompleted`)
      .send();
    const parseUpdateResponse = JSON.parse(markCompletedResponse.text);
    expect(parseUpdateResponse.completed).toBe(true);
  });
});
