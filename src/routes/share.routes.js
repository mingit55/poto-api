const { Router } = require('express');
const router = Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const blockStoragePath = process.env.BLOCK_STORAGE_PATH;
const upload = multer({ dest: path.resolve(__srcname + '/uploads') });

router.get('/', authMiddleware, async (req, res) => {
  let page = parseInt((req.query.page || '1').replace(/\D/, ''));
  let pageSize = parseInt((req.query.pageSize || '1').replace(/\D/, ''));

  const startIdx = (page - 1) * pageSize;

  try {
    const [rows] = await _db.query(
      `SELECT * FROM shares ORDER BY id DESC LIMIT ${startIdx}, ${pageSize}`,
    );
    const [cntRows] = await _db.query('SELECT COUNT(*) as cnt FROM shares');

    res.json({
      success: true,
      message: '게시물 목록 조회 성공',
      data: {
        list: rows,
        count: cntRows[0].cnt,
      },
    });
  } catch (err) {
    console.info(err);
    res.json({
      success: false,
      message: '게시물 목록 조회 실패',
    });
    return;
  }
});

router.get('/:id', async (req, res) => {
  let id = req.params.id;

  try {
    const [rows] = await _db.query(`SELECT * FROM shares WHERE id = ?`, [id]);
    if (!rows || rows.length === 0) {
      throw new Error();
    }
    const row = rows[0];

    const [images] = await _db.query(
      `SELECT * FROM share_photos WHERE shareId = ?`,
      [id],
    );

    if (!images || images.length === 0) {
      throw new Error();
    }

    res.json({
      success: true,
      data: {
        ...row,
        images: images.map((image) => ({
          ...image,
          imagePath: process.env.HOST + '/static/' + image.imageName,
        })),
      },
    });
  } catch (err) {
    console.info(err);
    res.json({
      success: false,
      message: '대상을 찾을 수 없습니다.',
    });
    return;
  }
});

router.post(
  '/',
  authMiddleware,
  upload.array('images', 300),
  async (req, res) => {
    const files = req.files.map((file, i) => {
      const filename =
        '' +
        new Date().getTime() +
        i +
        file.originalname.substring(file.originalname.lastIndexOf('.'));
      return {
        filename: filename,
        originalName: Buffer.from(file.originalname, 'latin1').toString(
          'utf-8',
        ),
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
        message: '파일 업로드에 실패하였습니다.',
      });
      return;
    }

    let share;
    let id = Math.random().toString(36).slice(-10);
    try {
      const [res] = await _db.execute('INSERT INTO shares (id) VALUES (?)', [
        id,
      ]);

      [share] = await _db.query('SELECT * FROM shares WHERE id = ?', [id]);
      share = share[0];
    } catch (err) {
      console.error(err);
      res.status(500).send({
        success: false,
        message: '게시물 작성에 실패했습니다.',
      });
      return;
    }

    let photos;
    try {
      await Promise.all(
        files.map(
          async (file, i) =>
            await _db.execute(
              'INSERT INTO share_photos (shareId, imageName, originalName) VALUES (?, ?, ?)',
              [share.id, file.filename, file.originalName],
            ),
        ),
      );
      const [list] = await _db.query(
        'SELECT * FROM article_photos WHERE articleId = ?',
        [share.id],
      );
      photos = list;
    } catch (err) {
      console.error(err);
      res.status(500).send({
        success: false,
        message: '게시물 파일 작성에 실패했습니다.',
      });
      return;
    }

    share.photos = photos;

    res.json({
      success: true,
      message: '게시물 작성 성공',
      data: share,
    });
  },
);

router.delete('/:id', authMiddleware, async (req, res) => {
  const id = req.params.id;

  try {
    const [rows] = await _db.query('SELECT * FROM shares WHERE id = ?', [
      id,
    ]);
    if (rows.length === 0) {
      throw new Error();
    }
  } catch (err) {
    console.info(err);
    res.json({
      success: false,
      message: '해당 공유 링크를 찾을 수 없습니다.',
    });
    return;
  }

  try {
    await _db.query('DELETE FROM shares WHERE id = ?', [id]);
  } catch (err) {
    console.info(err);
    res.json({
      success: false,
      message: '해당 공유 링크를 삭제할 수 없습니다.',
    });
    return;
  }

  res.json({
    success: true,
  });
});

router.post('/:id/thumbs', async (req, res) => {
  const id = req.params.id;
  const { id: imageId, isPass } = req.body;

  try {
    const [rows] = await _db.query(
      'SELECT * FROM share_photos WHERE id = ? AND shareId = ?',
      [imageId, id],
    );
    if (rows.length === 0) {
      throw new Error();
    }
  } catch (err) {
    console.info(err);
    res.json({
      success: false,
      message: '해당 이미지를 찾을 수 없습니다.',
    });
    return;
  }

  try {
    await _db.query('UPDATE share_photos SET isPass = ? WHERE id = ?', [
      isPass,
      imageId,
    ]);
  } catch (err) {
    console.info(err);
    res.json({
      success: false,
      message: '업데이트 중 문제가 발생했습니다.',
    });
    return;
  }

  res.json({
    success: true,
  });
});

module.exports = router;
