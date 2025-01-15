const { upload, uploader, getPublicId } = require('../cloudinary');

exports.getList = async (req, res) => {
  const { page, pageSize } = req.query;

  try {
    const startIdx = (page - 1) * pageSize;
    const list = await _db.query(
      `SELECT 
        row_number() over(order by created_at) no, 
        id, title, created_at 
        FROM dev_blog_articles 
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2`,
      [pageSize, startIdx],
    );
    const [{ totalCount }] = await _db.query(
      'SELECT COUNT(*) as totalCount FROM dev_blog_articles',
    );
    const totalPage = Math.ceil(totalCount / pageSize);

    res.json({
      success: true,
      data: {
        page,
        pageSize,
        list,
        totalCount,
        totalPage,
      },
    });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: '게시물 조회 도중 오류가 발생했습니다.',
    });
    return;
  }
};

exports.getItem = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.status(400).json({
      success: false,
      message: '게시물을 찾을 수 없습니다.',
    });
    return;
  }

  let article;
  try {
    const [row] = await _db.query(
      'SELECT id, title, content, created_at, updated_at FROM dev_blog_articles WHERE id = $1',
      [id],
    );
    article = row;
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: '게시물 조회 도중 오류가 발생했습니다.',
    });
    return;
  }

  if (!article) {
    res.status(404).json({
      success: false,
      message: '해당 게시물을 찾을 수 없습니다.',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: article,
  });
};

exports.createArticle = async (req, res) => {
  const { title, content } = req.body;

  if (!title?.trim().length || !content?.trim().length) {
    res.status(400).json({
      success: false,
      message: '제목과 내용을 입력하세요.',
    });
    return;
  }

  let insertId;
  try {
    const res = await _db.query(
      'INSERT INTO dev_blog_articles (title, content) VALUES ($1, $2)',
      [title, content],
      { raw: true },
    );
    const [item] = await _db.query('SELECT max(id) id from dev_blog_articles');
    insertId = item.id;
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: '게시물을 작성하는 도중 오류가 발생했습니다.',
    });
    return;
  }

  // 빈 이미지를 자동으로 해당 게시물에 엮기
  try {
    const tempImages = await _db.query(
      'SELECT id, image_path FROM dev_blog_article_images WHERE article_id IS NULL',
    );
    for (let image of tempImages) {
      // 파일 경로가 content 에 있어야 저장
      if (content.includes(image.image_path)) {
        await _db.query(
          'UPDATE dev_blog_article_images SET article_id = $1 WHERE id = $2',
          [insertId, image.id],
        );
      }
      // 없으면 폐기
      else {
        const publicId = getPublicId(image.image_path);
        await uploader.destroy(publicId);
        await _db.query('DELETE FROM dev_blog_article_images WHERE id = $1', [
          image.id,
        ]);
      }
    }
  } catch (err) {
    console.error(err);
  }

  res.status(200).json({
    success: true,
    data: {},
  });
};

exports.updateArticle = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.status(400).json({
      success: false,
      message: '게시물을 찾을 수 없습니다.',
    });
    return;
  }

  let article;
  try {
    const [row] = await _db.query(
      'SELECT id, title, content, created_at, updated_at FROM dev_blog_articles WHERE id = $1',
      [id],
    );
    article = row;
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: '게시물 조회 도중 오류가 발생했습니다.',
    });
    return;
  }
  if (!article) {
    res.status(404).json({
      success: false,
      message: '해당 게시물을 찾을 수 없습니다.',
    });
    return;
  }

  const { title, content } = req.body;

  if (!title?.trim().length || !content?.trim().length) {
    res.status(400).json({
      success: false,
      message: '제목과 내용을 입력하세요.',
    });
    return;
  }

  try {
    await _db.query(
      'UPDATE dev_blog_articles set title = $1, content = $2 WHERE id = $3',
      [title, content, id],
    );
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: '게시물을 작성하는 도중 오류가 발생했습니다.',
    });
    return;
  }

  // 기존에 업로드된 이미지 중 사라진게 있다면 삭제
  try {
    const existImages = await _db.query(
      'SELECT id, image_path FROM dev_blog_article_images WHERE article_id = $1',
      [id],
    );
    for (let image of existImages) {
      if (!content.includes(image.image_path)) {
        const publicId = getPublicId(image.image_path);
        await uploader.destroy(publicId);
        await _db.query('DELETE FROM dev_blog_article_images WHERE id = $1', [
          image.id,
        ]);
      }
    }
  } catch (err) {
    console.error(err);
  }

  // 빈 이미지를 자동으로 해당 게시물에 엮기
  try {
    const tempImages = await _db.query(
      'SELECT id, image_path FROM dev_blog_article_images WHERE article_id IS NULL',
    );
    for (let image of tempImages) {
      // 파일 경로가 content 에 있어야 저장
      if (content.includes(image.image_path)) {
        await _db.query(
          'UPDATE dev_blog_article_images SET article_id = $1 WHERE id = $2',
          [id, image.id],
        );
      }
      // 없으면 폐기
      else {
        const publicId = getPublicId(image.image_path);
        await uploader.destroy(publicId);
        await _db.query('DELETE FROM dev_blog_article_images WHERE id = $1', [
          image.id,
        ]);
      }
    }
  } catch (err) {
    console.error(err);
  }

  res.status(200).json({
    success: true,
    data: {},
  });
};

exports.deleteArticle = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.status(400).json({
      success: false,
      message: '게시물을 찾을 수 없습니다.',
    });
    return;
  }

  let article;
  try {
    const [row] = await _db.query(
      'SELECT id, title, content, created_at, updated_at FROM dev_blog_articles WHERE id = $1',
      [id],
    );
    article = row;
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: '게시물 조회 도중 오류가 발생했습니다.',
    });
    return;
  }
  if (!article) {
    res.status(404).json({
      success: false,
      message: '해당 게시물을 찾을 수 없습니다.',
    });
    return;
  }

  try {
    await _db.query('DELETE FROM dev_blog_articles WHERE id = $1', [id]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: '해당 게시물을 삭제하는 도중 문제가 발생했습니다.',
    });
    return;
  }

  try {
    const images = await _db.query(
      'SELECT id, image_path FROM dev_blog_article_images WHERE article_id = $1',
      [id],
    );
    for (let image of images) {
      const publicId = getPublicId(image.image_path);
      await uploader.destroy(publicId);
      await _db.query('DELETE FROM dev_blog_article_images WHERE id = $1', [
        image.id,
      ]);
    }
  } catch (err) {
    console.error(err);
  }

  res.status(200).json({
    success: true,
  });
};

exports.createArticleImage = async (req, res) => {
  const file = req.file;

  if (!file) {
    res.status(400).json({
      success: false,
      message: '파일을 업로드 해 주세요.',
    });
    return;
  }

  let image;
  try {
    image = await upload(file);
    await _db.execute(
      'INSERT INTO dev_blog_article_images (image_path, original_name) VALUES($1, $2)',
      [image.url, image.original_name],
    );
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: '파일 업로드에 실패했습니다.',
    });
  }

  res.status(200).json({ success: true, data: image });
};
