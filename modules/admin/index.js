const express = require('express');
const router = express.Router();
const authController = require('./auth/authController');
const berandaController = require('./beranda/berandaController');
const userAdminController = require('./userAdmin/userAdminController');
const pegawaiController = require('./pegawai/pegawaiController');
const jabatanController = require('./jabatan/jabatanController');
const divisiController = require('./divisi/divisiController');
const pekerjaanController = require('./pekerjaan/pekerjaanController');
const levelController = require('./level/levelController');
const aktivitasController = require('./aktivitas/aktivitasController');
const ckpKeseluruhanController = require('./ckpKeseluruhan/ckpController');
const ckpDivisiController = require('./ckpDivisi/ckpController');
const ckpPegawaiController = require('./ckpPegawai/ckpController');

router.use('/auth', authController);
router.use('/', berandaController);
router.use('/user-admin', userAdminController);
router.use('/pegawai', pegawaiController);
router.use('/jabatan', jabatanController);
router.use('/divisi', divisiController);
router.use('/pekerjaan', pekerjaanController);
router.use('/level', levelController);
router.use('/aktivitas', aktivitasController);
router.use('/ckp-keseluruhan', ckpKeseluruhanController);
router.use('/ckp-divisi', ckpDivisiController);
router.use('/ckp-pegawai', ckpPegawaiController);

module.exports = router;