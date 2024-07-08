const middlewares = [require("./cors.middleware")];
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

module.exports = {
  init(app) {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(cookieParser());
    middlewares.forEach((middleware) => {
      app.use(middleware);
    });
  },
};
