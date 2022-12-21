const express = require('express');
const router = express.Router();
const pekerjaanValidator = require('./pekerjaanValidator');
const pekerjaanService = require('./pekerjaanService');
const getBaseUrl = require('../../../utils/getBaseUrl');
const sessionVerify = require('../auth/sessionVerify');
const divisiService = require('../divisi/divisiService');
const levelService = require('../level/levelService');

// router.use(sessionVerify);

// page daftar pekerjaan
router.get('/daftar', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const { idDivisi } = req.query;

    let data = [];
    let currentPage = 1;
    let totalPage = 1;

    if (idDivisi) {
      pekerjaan = await pekerjaanService.dataPekerjaanDivisi(req, res);

      if (pekerjaan.statusCode > 200) {
        return res.redirect(`${baseUrl}/admin/pekerjaan/daftar`);
      }

      data = pekerjaan.data;
      currentPage = pekerjaan.currentPage;
      totalPage = pekerjaan.totalPage;
    }

    const divisi = await divisiService.dataLengkap(req, res);
    const level = await levelService.dataLengkap(req, res);

    return res.render('admin/pekerjaan/daftarPekerjaan', {
      baseUrl,
      req,
      divisi: divisi.data,
      level: level.data,
      data,
      currentPage,
      totalPage,
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