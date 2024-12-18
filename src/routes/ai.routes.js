const express = require('express');
const router = express.Router();

const { request, getCategories } = require('../controllers/ai.controller');

router.post('/request', request);

router.get('/category', getCategories);

module.exports = router;
