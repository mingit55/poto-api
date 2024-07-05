// Get the client
const mysql = require("mysql2/promise");

module.exports = {
  async init() {
    // Create the connection to database
    global._db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
  },
};
