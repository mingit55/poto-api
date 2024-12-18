const blockStoragePath = process.env.BLOCK_STORAGE_PATH;
const fs = require('fs');

exports.createArticle = async (req, res) => {
  const { title, descript, photoAt, model, link, level, photoType, locale } =
    req.body;

  const files = req.files.map((file, i) => {
    const filename =
      '' +
      new Date().getTime() +
      i +
      file.originalname.substring(file.originalname.lastIndexOf('.'));
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
      message: '파일 업로드에 실패하였습니다.',
    });
    return;
  }

  let article;
  try {
    const res = await _db.execute(
      'INSERT INTO articles (title, descript, photoAt, model, link, level, photoType, locale) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [title, descript, photoAt, model, link, level, photoType, locale],
    );

    article = await _db.query('SELECT * FROM articles WHERE id =$1', [
      res.insertId,
    ]);
    article = article[0];
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
            'INSERT INTO article_photos (articleId, imageName, idx) VALUES ($1, $2, $3)',
            [article.id, file.filename, i],
          ),
      ),
    );
    const list = await _db.query(
      'SELECT * FROM article_photos WHERE articleId = $1',
      [article.id],
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

  article.photos = photos;

  res.json({
    success: true,
    message: '게시물 작성 성공',
    data: article,
  });
};

exports.getList = async (req, res) => {
  let page = parseInt((req.query.page || '1').replace(/\D/, ''));
  let pageSize = parseInt((req.query.pageSize || '1').replace(/\D/, ''));

  const startIdx = (page - 1) * pageSize;

  try {
    const rows = await _db.query(
      `SELECT * FROM articles ORDER BY id DESC LIMIT ${pageSize} OFFSET ${startIdx}`,
    );
    const cntRows = await _db.query('SELECT COUNT(*) as cnt FROM articles');

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
  }
};

exports.getItem = async (req, res) => {
  const id = req.params.id;
  const rows = await _db.query(`SELECT * FROM articles WHERE id = $1`, [id]);
  if (rows.length === 0) {
    return res.json({
      success: false,
      message: '해당 게시물을 찾을 수 없습니다.',
    });
  }

  const images = await _db.query(
    'SELECT imageName FROM article_photos WHERE articleId = $1',
    [id],
  );

  rows[0].images = images.map((v) => v.imageName);

  res.json({
    success: true,
    data: rows[0],
  });
};

exports.updateArticle = async (req, res) => {
  const id = req.params.id;
  const { title, descript, photoAt, model, link, level, photoType, locale } =
    req.body;
  const deletedImages = JSON.parse(req.body.deletedImages);

  try {
    let rows = await _db.query('SELECT * FROM articles WHERE id = $1', [id]);
    if (rows.length === 0) {
      res.status(400).send({
        success: false,
        message: '해당 게시물을 찾을 수 없습니다.',
      });
      return;
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: '게시물을 찾는데에 실패했습니다.',
    });
  }

  const files = req.files.map((file, i) => {
    const filename =
      '' +
      new Date().getTime() +
      i +
      file.originalname.substring(file.originalname.lastIndexOf('.'));
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
      message: '파일 업로드에 실패하였습니다.',
    });
    return;
  }

  try {
    deletedImages.forEach((imageName) => {
      const filePath = path.join(blockStoragePath, imageName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      _db.query('DELETE FROM article_photos WHERE imageName = $1', [imageName]);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: '삭제된 이미지 처리에 실패했습니다.',
    });
    return;
  }

  try {
    await Promise.all(
      files.map(
        async (file, i) =>
          await _db.execute(
            'INSERT INTO article_photos (articleId, imageName, idx) VALUES ($1, $2, $3)',
            [id, file.filename, i],
          ),
      ),
    );
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: '게시물 파일 작성에 실패했습니다.',
    });
    return;
  }

  try {
    await _db.execute(
      'UPDATE articles SET title =$1, descript =$2, photoAt =$3, model =$4, link =$5, level= $6, photoType= $7, locale= $8 WHERE id =$9',
      [title, descript, photoAt, model, link, level, photoType, locale, id],
    );
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: '게시물 수정에 실패했습니다.',
    });
    return;
  }

  res.status(200).send({
    success: true,
  });
};

exports.deleteArticle = async (req, res) => {
  const id = req.params.id;

  try {
    let rows = await _db.query('SELECT * FROM articles WHERE id = $1', [id]);
    if (rows.length === 0) {
      res.status(400).send({
        success: false,
        message: '해당 게시물을 찾을 수 없습니다.',
      });
      return;
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: '게시물을 찾는데에 실패했습니다.',
    });
  }

  try {
    _db.execute('DELETE FROM articles WHERE id =$1', [id]);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: '게시물 삭제에 실패했습니다.',
    });
    return;
  }

  res.status(200).send({
    success: true,
  });
};
