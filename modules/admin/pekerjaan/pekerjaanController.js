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

// page tambah pekerjaan
router.get('/tambah', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const { old_input } = req.query;
    if (!old_input) {
      delete req.session.oldPekerjaan;
    }

    const divisi = await divisiService.dataLengkap(req, res);
    const level = await levelService.dataLengkap(req, res);
    return res.render('admin/pekerjaan/tambahPekerjaan', {
      baseUrl,
      req,
      divisi: divisi.data,
      level: level.data,
    });
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// tambah pekerjaan
router.post('/tambah', pekerjaanValidator.tambahPekerjaan, async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);

    const tambahPekerjaan = await pekerjaanService.tambahPekerjaan(req, res);
    if (tambahPekerjaan.statusCode > 200) {
      return res.redirect(`${baseUrl}/admin/pekerjaan/tambah?old_input=true`);
    }

    delete req.session.oldPekerjaan;
    req.session.alert = [{msg: 'Berhasil menambah pekerjaan'}];

    return res.redirect(`${baseUrl}/admin/pekerjaan/daftar`);
  } catch (error) {
    console.log(error.message);
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

module.exports = router;