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
router.use('/articles', require('./article.routes'));

module.exports = router;
