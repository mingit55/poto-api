// Get the client
// const mysql = require("mysql2/promise");
const { Client } = require('pg');

module.exports = {
  async init() {
    // Create the connection to database
    // global._dbpool = mysql.createPool({
    //   host: process.env.DB_HOST,
    //   user: process.env.DB_USER,
    //   password: process.env.DB_PASSWORD,
    //   database: process.env.DB_DATABASE,
    //   connectionLimit: 10, // Maximum number of connections
    //   waitForConnections: true, // Wait for a connection before creating a new one
    //   // maxWaitTime: 5000, // Maximum time to wait for a connection in milliseconds
    // })

    global._db = {
      async query(sql, data, options = {}) {
        // const conn = await  _dbpool.getConnection();
        // const result = conn.query(...arguments);
        // conn.release();
        // return result;

        const client = new Client({
          connectionString: process.env.DB_URL,
          ssl: {
            rejectUnauthorized: false,
          },
        });
        client.connect();
        const res = await client.query(sql, data);
        client.end();

        if (options.raw) {
          return res;
        }

        return res.rows;
      },
      async execute() {
        return await this.query(...arguments);
      },
    };
  },
};
