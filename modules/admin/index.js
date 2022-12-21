const express = require('express');
const router = express.Router();
const authController = require('./auth/authController');
const berandaController = require('./beranda/berandaController');
const userAdminController = require('./userAdmin/userAdminController');
const pegawaiController = require('./pegawai/pegawaiController');
const jabatanController = require('./jabatan/jabatanController');
const divisiController = require('./divisi/divisiController');

router.use('/auth', authController);
router.use('/', berandaController);
router.use('/user-admin', userAdminController);
router.use('/pegawai', pegawaiController);
router.use('/jabatan', jabatanController);
router.use('/divisi', divisiController);

module.exports = router;