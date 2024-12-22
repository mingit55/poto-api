const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const db = require('./db');
db.init();

const path = require('path');
__srcname = path.resolve(__dirname);

const app = express();
app.use(bodyParser.json({
  limit: '2000mb',
}));

const middleware = require("./middlewares");
middleware.init(app);

const routes = require("./routes");
app.use(routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
