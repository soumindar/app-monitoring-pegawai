const express = require('express');
const router = express.Router();
const authController = require('./auth/authController');
const berandaController = require('./beranda/berandaController');
const pegawaiController = require('./pegawai/pegawaiController');
const pekerjaanController = require('./pekerjaan/pekerjaanController');

router.use('/auth', authController);
router.use('/', berandaController);
router.use('/pegawai', pegawaiController);
router.use('/pekerjaan', pekerjaanController);

module.exports = router;