const { Router } = require('express');
const router = Router();
const controller = require('../controllers/dev-article.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.get('/', controller.getList);
router.get('/:id', controller.getItem);
router.post('/', authMiddleware, controller.createArticle);
router.put('/:id', authMiddleware, controller.updateArticle);
router.delete('/:id', authMiddleware, controller.deleteArticle);

module.exports = router;
