// Get the client
const mysql = require("mysql2/promise");

module.exports = {
  async init() {
    // Create the connection to database
    global._dbpool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      connectionLimit: 10, // Maximum number of connections
      waitForConnections: true, // Wait for a connection before creating a new one
      // maxWaitTime: 5000, // Maximum time to wait for a connection in milliseconds
    })

    global._db = {
      async query() {
        const conn = await  _dbpool.getConnection();
        const result = conn.query(...arguments);
        conn.release();
        return result;
      },
      async execute() {
        const conn = await  _dbpool.getConnection();
        const result = conn.execute(...arguments);
        conn.release();
        return result;
      },
    };
  },
};
