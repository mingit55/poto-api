const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { authMiddleware } = require('../middlewares/auth.middleware');
const {
  createArticle,
  getList,
  getItem,
  updateArticle,
  deleteArticle,
} = require('../controllers/article.controller');

const upload = multer({ dest: path.resolve(__srcname + '/uploads') });

router.post('/', authMiddleware, upload.array('images', 20), createArticle);

router.get('/', getList);

router.get('/:id', getItem);

router.put('/:id', authMiddleware, upload.array('images', 20), updateArticle);

router.delete('/:id', authMiddleware, deleteArticle);

module.exports = router;
