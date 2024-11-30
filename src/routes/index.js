const { Router } = require("express");
const router = Router();

router.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Welcome to Poto API",
    data: {},
  });
});
router.use("/auth", require("./auth.routes"));
router.use("/articles", require("./article.routes"));
router.use("/shares", require("./share.routes"));
router.use('/ai', require('./ai.routes'));

module.exports = router;
