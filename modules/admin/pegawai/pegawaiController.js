const express = require('express');
const router = express.Router();
const adminValidator = require('./pegawaiValidator');
const adminService = require('./pegawaiService');
const getBaseUrl = require('../../../utils/getBaseUrl');
const sessionVerify = require('../auth/sessionVerify');

// router.use(sessionVerify);

// page daftar pegawai
router.get('/daftar', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const getData = await adminService.dataPegawai(req);

    return res.render('admin/daftarPegawai', {
      baseUrl,
      req,
      data: getData.data,
      currentPage: getData.currentPage,
      totalPage: getData.totalPage,
    });
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// page tambah pegawai
router.get('/tambah-pegawai', (req, res) => {
  const baseUrl = getBaseUrl(req);
  const jabatan = await 
  return res.render('admin/tambahPegawai', {
    baseUrl,
    req,
  });
});

// tambah pegawai
router.post('/tambah-pegawai', adminValidator.tambahPegawai);

module.exports = router;