const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const blockStoragePath = process.env.BLOCK_STORAGE_PATH;

const upload = multer({ dest: path.resolve(__srcname + "/uploads") });

router.post("/", upload.array("images", 20), async (req, res) => {
  const { title, descript, photoAt, model, link } = req.body;

  const files = req.files.map((file, i) => {
    const filename =
      "" +
      new Date().getTime() +
      i +
      file.originalname.substring(file.originalname.lastIndexOf("."));
    return {
      filename: filename,
      originalName: file.originalname,
      tempPath: file.path,
      targetPath: path.join(blockStoragePath, filename),
    };
  });

  try {
    files.forEach((file) => {
      fs.renameSync(file.tempPath, file.targetPath);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: "파일 업로드에 실패하였습니다.",
    });
    return;
  }

  let article;
  try {
    const [res] = await _db.execute(
      "INSERT INTO articles (title, descript, photoAt, model, link) VALUES (?,?,?,?,?)",
      [title, descript, photoAt, model, link]
    );

    [article] = await _db.query("SELECT * FROM articles WHERE id =?", [
      res.insertId,
    ]);
    article = article[0];
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: "게시물 작성에 실패했습니다.",
    });
    return;
  }

  let photos;
  try {
    await Promise.all(
      files.map(
        async (file, i) =>
          await _db.execute(
            "INSERT INTO article_photos (articleId, imageName, idx) VALUES (?, ?, ?)",
            [article.id, file.filename, i]
          )
      )
    );
    const [list] = await _db.query("SELECT * FROM article_photos WHERE articleId = ?", [article.id]);
    photos = list;
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: "게시물 파일 작성에 실패했습니다.",
    });
    return;
  }

  article.photos = photos; 

  res.json({
    success: true,
    message: "게시물 작성 성공",
    data: article,
  });
});

module.exports = router;
