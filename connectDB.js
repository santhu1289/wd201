// connectDB.js

const { Sequelize } = require("sequelize");

const database = "todo_db";
const username = "postgres";
const password = "changeme";
const sequelize = new Sequelize(database, username, password, {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});

// Test the connection
const connect = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

// Call the connect function
connect();

// Export the sequelize instance and connect function
module.exports = {
  connect,
  sequelize,
};
