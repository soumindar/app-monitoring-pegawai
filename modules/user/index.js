const express = require('express');
const router = express.Router();
const authController = require('./auth/authController');
const berandaController = require('./beranda/berandaController');

router.use('/auth', authController);
router.use('/', berandaController);

module.exports = router;