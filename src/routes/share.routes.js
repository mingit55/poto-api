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
  createSharePhoto,
} = require('../controllers/share.controller');

const upload = multer();

router.get('/', authMiddleware, getList);

router.get('/:id', getItem);

router.post('/', authMiddleware, createShare);

router.post(
  '/:id/photos',
  authMiddleware,
  upload.array('images', 100),
  createSharePhoto,
);

router.delete('/:id', authMiddleware, deleteShare);

router.post('/:id/thumbs', thumbShare);

module.exports = router;
