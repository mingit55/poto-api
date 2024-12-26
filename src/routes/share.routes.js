const { Router } = require('express');
const router = Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const multer = require('multer');

const {
  getList,
  getItem,
  createShare,
  deleteShare,
  thumbShare,
} = require('../controllers/share.controller');

const upload = multer();

router.get('/', authMiddleware, getList);

router.get('/:id', getItem);

router.post('/', authMiddleware, upload.array('images', 1000), createShare);

router.delete('/:id', authMiddleware, deleteShare);

router.post('/:id/thumbs', thumbShare);

module.exports = router;
