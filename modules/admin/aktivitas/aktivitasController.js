const express = require('express');
const router = express.Router();
const getBaseUrl = require('../../../utils/getBaseUrl');
const aktivitasValidator = require('./aktivitasValidator');
const aktivitasService = require('./aktivitasService');
const pegawaiService = require('../pegawai/pegawaiService');
const sessionVerify = require('../auth/sessionVerify');

// router.use(sessionVerify);

// page daftar aktivitas
router.get('/daftar', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const aktivitas = await aktivitasService.dataAktivitas(req, res);

    return res.render('admin/aktivitas/daftarAktivitas', {
      baseUrl,
      req,
      data: aktivitas.data,
      currentPage: aktivitas.currentPage,
      totalPage: aktivitas.totalPage,
    });
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

module.exports = router;