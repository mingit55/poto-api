const { Router } = require("express");
const router = Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  const { userId, password } = req.body;
  const [user] = await _db.execute(
    "SELECT id, userId, password FROM users where userId = ?",
    [userId]
  );

  if (!user) {
    res.json({
      success: false,
      message: "해당 아이디의 회원을 찾을 수 없습니다.",
    });
    return;
  } else if (!bcrypt.compareSync(password, user[0].password)) {
    res.json({
      success: false,
      message: "비밀번호가 일치하지 않습니다.",
    });
    return;
  }

  delete user[0].password;

  const token = jwt.sign(user[0], process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRESIN,
  });
  res.cookie("ACCESS_TOKEN", token, {
    domain: process.env.DOMAIN,
    expires: new Date(Date.now() + process.env.JWT_EXPIRESIN * 1),
    sameSite: "none",
    secure: true,
  });
  res.json({ success: true, data: user[0] });
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
    const [res] = await _db.query(
      "INSERT INTO users (userId, password) VALUES (?,?)",
      [userId, bcrypt.hashSync(password)]
    );

    const id = res.insertId;
    const [res2] = await _db.execute(
      "SELECT id, userId FROM users WHERE id = ?",
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

router.get("/check", async (req, res) => {
  const token = req.cookies["ACCESS_TOKEN"];

  if (!token) {
    return res.json({ success: false, message: "Token not found" });
  }

  const check = new Promise((res, rej) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        rej(err);
      } else {
        res(payload);
      }
    });
  });

  check
    .then((payload) => {
      res.status(200).json({ success: true, data: payload });
    })
    .catch((error) => {
      res.status(403).json({
        success: false,
        message: error.message,
      });
    });
});

module.exports = router;
