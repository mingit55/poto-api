const express = require("express");
const router = express.Router();
const multer = require("multer");
const blockStoragePath = process.env.BLOCK_STORAGE_PATH;
const path = require("path");

app.use("/static", express.static(blockStoragePath));

const upload = multer({ dest: path.resolve(__srcname + "/uploads") });


router.post("/", upload.array("images", 20), async (req, res) => {
  try {
    const files = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalName,
      tempPath: file.path,
      targetpath: path.join(blockStoragePath, file.filename),
    }));

    files.forEach(file => {
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
});
