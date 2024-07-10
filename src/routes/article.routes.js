const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { authMiddleware } = require("../middlewares/auth.middleware");

const blockStoragePath = process.env.BLOCK_STORAGE_PATH;

const upload = multer({ dest: path.resolve(__srcname + "/uploads") });

router.post(
  "/",
  authMiddleware,
  upload.array("images", 20),
  async (req, res) => {
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
      const [list] = await _db.query(
        "SELECT * FROM article_photos WHERE articleId = ?",
        [article.id]
      );
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
  }
);

router.get("/", async (req, res) => {
  let page = parseInt((req.query.page || "1").replace(/\D/, ""));
  let pageSize = parseInt((req.query.pageSize || "1").replace(/\D/, ""));

  const startIdx = (page - 1) * pageSize;

  try {
    const [rows] = await _db.query(
      `SELECT * FROM articles ORDER BY id DESC LIMIT ${startIdx}, ${pageSize}`
    );
    const [cntRows] = await _db.query("SELECT COUNT(*) as cnt FROM articles");

    res.json({
      success: true,
      message: "게시물 목록 조회 성공",
      data: {
        list: rows,
        count: cntRows[0].cnt,
      },
    });
  } catch (err) {
    console.info(err);
    res.json({
      success: false,
      message: "게시물 목록 조회 실패",
    });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const [rows] = await _db.query(`SELECT * FROM articles WHERE id = ?`, [id]);
  if (rows.length === 0) {
    return res.json({
      success: false,
      message: "해당 게시물을 찾을 수 없습니다.",
    });
  }

  const [images] = await _db.query(
    "SELECT imageName FROM article_photos WHERE articleId = ?",
    [id]
  );

  rows[0].images = images.map((v) => v.imageName);

  res.json({
    success: true,
    data: rows[0],
  });
});

router.put(
  "/:id",
  authMiddleware,
  upload.array("images", 20),
  async (req, res) => {
    const id = req.params.id;
    const { title, descript, photoAt, model, link } = req.body;
    const deletedImages = JSON.parse(req.body.deletedImages);

    try {
      let [rows] = await _db.query("SELECT * FROM articles WHERE id = ?", [id]);
      if (rows.length === 0) {
        res.status(400).send({
          success: false,
          message: "해당 게시물을 찾을 수 없습니다.",
        });
        return;
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        success: false,
        message: "게시물을 찾는데에 실패했습니다.",
      });
    }

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

    try {
      deletedImages.forEach((imageName) => {
        const filePath = path.join(blockStoragePath, imageName);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        _db.query("DELETE FROM article_photos WHERE imageName = ?", [
          imageName,
        ]);
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        success: false,
        message: "삭제된 이미지 처리에 실패했습니다.",
      });
      return;
    }

    try {
      await Promise.all(
        files.map(
          async (file, i) =>
            await _db.execute(
              "INSERT INTO article_photos (articleId, imageName, idx) VALUES (?, ?, ?)",
              [id, file.filename, i]
            )
        )
      );
    } catch (err) {
      console.error(err);
      res.status(500).send({
        success: false,
        message: "게시물 파일 작성에 실패했습니다.",
      });
      return;
    }

    try {
      await _db.execute(
        "UPDATE articles SET title =?, descript =?, photoAt =?, model =?, link =? WHERE id =?",
        [title, descript, photoAt, model, link, id]
      );
    } catch (err) {
      console.error(err);
      res.status(500).send({
        success: false,
        message: "게시물 수정에 실패했습니다.",
      });
      return;
    }

    res.status(200).send({
      success: true,
    });
  }
);

router.delete("/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;

  try {
    let [rows] = await _db.query("SELECT * FROM articles WHERE id = ?", [id]);
    if (rows.length === 0) {
      res.status(400).send({
        success: false,
        message: "해당 게시물을 찾을 수 없습니다.",
      });
      return;
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: "게시물을 찾는데에 실패했습니다.",
    });
  }

  try {
    _db.execute("DELETE FROM articles WHERE id =?", [id]);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: "게시물 삭제에 실패했습니다.",
    });
    return;
  }

  res.status(200).send({
    success: true,
  });
});

module.exports = router;
