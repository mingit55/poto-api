const { Router } = require('express');
const router = Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');

const {
  getList,
  getItem,
  createShare,
  deleteShare,
  thumbShare,
} = require('../controllers/share.controller');

const upload = multer({ storage });

router.get('/', authMiddleware, getList);

router.get('/:id', getItem);

router.post('/', authMiddleware, upload.array('images', 300), createShare);

router.delete('/:id', authMiddleware, deleteShare);

router.post('/:id/thumbs', thumbShare);

module.exports = router;
