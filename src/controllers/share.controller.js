const fs = require('fs');
const { uploader } = require('../cloudinary');
const blockStoragePath = process.env.BLOCK_STORAGE_PATH;

exports.getList = async (req, res) => {
  let page = parseInt((req.query.page || '1').replace(/\D/, ''));
  let pageSize = parseInt((req.query.pageSize || '1').replace(/\D/, ''));

  const startIdx = (page - 1) * pageSize;

  try {
    const rows = await _db.query(
      `SELECT * FROM shares ORDER BY id DESC LIMIT ${pageSize} OFFSET ${startIdx}`,
    );
    const cntRows = await _db.query('SELECT COUNT(*) as cnt FROM shares');

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
};

exports.getItem = async (req, res) => {
  let id = req.params.id;

  try {
    const rows = await _db.query(`SELECT * FROM shares WHERE id = $1`, [id]);
    if (!rows || rows.length === 0) {
      throw new Error();
    }
    const row = rows[0];

    const images = await _db.query(
      `SELECT * FROM share_photos WHERE share_id = $1`,
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
};

exports.createShare = async (req, res) => {
  let share;
  let id = Math.random().toString(36).slice(-10);
  try {
    await _db.execute('INSERT INTO shares (id) VALUES ($1)', [id]);

    [share] = await _db.query('SELECT * FROM shares WHERE id = $1', [id]);
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
      req.files.map(
        async (file) =>
          await _db.execute(
            'INSERT INTO share_photos (share_id, image_path, original_name) VALUES ($1, $2, $3)',
            [share.id, file.path, file.originalname],
          ),
      ),
    );
    const list = await _db.query(
      'SELECT * FROM share_photos WHERE share_id = $1',
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
};

exports.deleteShare = async (req, res) => {
  const id = req.params.id;

  let share;
  try {
    const rows = await _db.query('SELECT * FROM shares WHERE id = $1', [id]);
    if (rows.length === 0) {
      throw new Error();
    }
    share = rows[0];
  } catch (err) {
    console.info(err);
    res.json({
      success: false,
      message: '해당 공유 링크를 찾을 수 없습니다.',
    });
    return;
  }

  let images;
  try {
    images = await _db.query('SELECT * FROM share_photos WHERE share_id = $1', [
      share.id,
    ]);
  } catch (err) {
    console.info(err);
    res.json({
      success: false,
      message: '이미지 파일을 불러오는 데에 실패했습니다.',
    });
  }

  try {
    await Promise.all(
      images.map(async (image) => {
        const publicId = 'poto/' + image.image_path.split('/').pop().split('.')[0];
        console.info(publicId);
        await uploader.destroy(publicId);
      }),
    );
  } catch (err) {
    console.info(err);
    res.json({
      success: false,
      message: '이미지 파일을 삭제하는 데에 실패했습니다.',
    });
  }

  try {
    await _db.query('DELETE FROM shares WHERE id = $1', [id]);
    await _db.query('DELETE FROM share_photos WHERE share_id = $1', [id]);
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
};

exports.thumbShare = async (req, res) => {
  const id = req.params.id;
  const { id: imageId, is_pass } = req.body;

  try {
    const rows = await _db.query(
      'SELECT * FROM share_photos WHERE id = $1 AND share_id = $2',
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
    await _db.query('UPDATE share_photos SET is_pass = $1 WHERE id = $2', [
      is_pass,
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
};
