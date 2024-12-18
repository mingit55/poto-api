const { Router } = require("express");
const router = Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.post("/login", async (req, res) => {
  const { userId, password } = req.body;
  const [user] = await _db.execute(
    "SELECT id, userId, password FROM users where userId = $1",
    [userId]
  );
  console.info(user);

  if (!user) {
    res.json({
      success: false,
      message: "해당 아이디의 회원을 찾을 수 없습니다.",
    });
    return;
  } else if (!bcrypt.compareSync(password, user.password)) {
    res.json({
      success: false,
      message: "비밀번호가 일치하지 않습니다.",
    });
    return;
  }

  delete user.password;

  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRESIN,
  });
  res.cookie("ACCESS_TOKEN", token, {
    domain: process.env.DOMAIN,
    expires: new Date(Date.now() + process.env.JWT_EXPIRESIN * 1),
    sameSite: "none",
    secure: true,
  });
  res.json({ success: true, data: user });
});

router.post("/join", async (request, response) => {
  const { userId, password } = request.body;

  if (!userId || !password) {
    response.json({
      success: false,
      message: "아이디와 비밀번호를 모두 입력해 주세요.",
    });
    return;
  }

  try {
    console.info(userId, bcrypt.hashSync(password));
    const res = await _db.query(
      "INSERT INTO users (userId, password) VALUES ($1, $2)",
      [userId, bcrypt.hashSync(password)]
    );

    const id = res[0].id;
    const res2 = await _db.execute(
      "SELECT id, userId FROM users WHERE id = $1",
      [id]
    );
    response.json({
      success: true,
      message: "회원가입이 완료되었습니다.",
      data: res2[0],
    });
  } catch (err) {
    console.error(err);

    response.json({
      success: false,
      message: "회원가입에 실패하였습니다.",
    });
  }
});

router.get("/check", authMiddleware, async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

module.exports = router;
