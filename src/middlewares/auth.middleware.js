const jwt = require('jsonwebtoken');

exports.authMiddleware = (req, res, next) => {
  const token = req.cookies["ACCESS_TOKEN"];
  if (!token) {
    return res.json({ success: false, message: "로그인 정보가 없습니다." });
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
      req.user = payload;
      next();
    })
    .catch((error) => {
      res.status(403).json({
        success: false,
        message: error.message,
      });
    });
};
