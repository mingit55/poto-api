const middlewares = [require("./cors.middleware")];
const bodyParser = require("body-parser");

module.exports = {
  init(app) {
    middlewares.forEach((middleware) => {
      app.use(bodyParser.urlencoded({ extended: false }));
      app.use(bodyParser.json());

      app.use(middleware);
    });
  },
};
