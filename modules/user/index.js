const express = require('express');
const router = express.Router();
const authController = require('./auth/authController');
const berandaController = require('./beranda/berandaController');
const pegawaiController = require('./pegawai/pegawaiController');
const pekerjaanController = require('./pekerjaan/pekerjaanController');
const aktivitasController = require('./aktivitas/aktivitasController');
const ckpController = require('./ckp/ckpController');

router.use('/auth', authController);
router.use('/', berandaController);
router.use('/pegawai', pegawaiController);
router.use('/pekerjaan', pekerjaanController);
router.use('/aktivitas', aktivitasController);
router.use('/ckp', ckpController);

module.exports = router;