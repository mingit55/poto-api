const { Router } = require('express');
const router = Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const authController = require('../controllers/auth.controller');

router.post('/login', authController.login);

router.post('/join', authController.join);

router.get('/check', authMiddleware, authController.authCheck);

module.exports = router;
