const { Router } = require('express');
const router = Router();
const controller = require('../controllers/dev-article.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const multer = require('multer');
const upload = multer();

router.get('/', controller.getList);
router.get('/:id', controller.getItem);
router.post('/', authMiddleware, controller.createArticle);
router.put('/:id', authMiddleware, controller.updateArticle);
router.delete('/:id', authMiddleware, controller.deleteArticle);

router.post(
  '/images',
  authMiddleware,
  upload.single('image'),
  controller.createArticleImage,
);

module.exports = router;
