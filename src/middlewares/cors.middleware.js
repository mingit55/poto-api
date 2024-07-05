const cors = require("cors");
const origins = process.env.WEB_HOST.split(",");

const options = {
  origin: origins,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  preflightContinue: false,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

module.exports = cors(options);
