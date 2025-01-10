exports.getList = async (req, res) => {
  const { page, pageSize } = req.query;

  try {
    const startIdx = (page - 1) * pageSize;
    const list = await _db.query(
      `SELECT 
        row_number() over(order by created_at) no, 
        id, title, created_at 
        FROM dev_blog_articles 
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

  try {
    const res = await _db.query(
      'INSERT INTO dev_blog_articles (title, content) VALUES ($1, $2)',
      [title, content],
    );
    console.info(res);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: '게시물을 작성하는 도중 오류가 발생했습니다.',
    });
    return;
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
    const res = await _db.query(
      'UPDATE dev_blog_articles set title = $1, content = $2 WHERE id = $3',
      [title, content, id],
    );
    console.info(res);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: '게시물을 작성하는 도중 오류가 발생했습니다.',
    });
    return;
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
    _db.query('DELETE FROM dev_blog_articles WHERE id = $1', [id]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: '해당 게시물을 삭제하는 도중 문제가 발생했습니다.',
    });
    return;
  }

  res.status(200).json({
    success: true,
  });
};
