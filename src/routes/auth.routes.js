const { Router } = require("express");
const router = Router();
const bcrypt = require("bcryptjs");

router.post("/login", async (req, res) => {
  const { user_id, password } = req.body;
  const [user] = await _db.execute(
    "SELECT id, user_id, password FROM users where user_id = ?",
    [user_id]
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

  res.json({ success: true, data: user[0] });
});

router.post("/join", async (request, response) => {
  const { user_id, password } = request.body;

  if (!user_id || !password) {
    response.json({
      success: false,
      message: "아이디와 비밀번호를 모두 입력해 주세요.",
    });
    return;
  }

  try {
    console.info(user_id, bcrypt.hashSync(password));
    const [res] = await _db.query(
      "INSERT INTO users (user_id, password) VALUES (?,?)",
      [user_id, bcrypt.hashSync(password)]
    );

    const id = res.insertId;
    const [res2] = await _db.execute(
      "SELECT id, user_id FROM users WHERE id = ?",
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

module.exports = router;
