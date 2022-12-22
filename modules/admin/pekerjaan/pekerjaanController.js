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

// page ubah data pekerjaan
router.get('/ubah/:id', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const { old_input } = req.query;
    if (!old_input) {
      delete req.session.oldPekerjaan;
    }

    const pekerjaan = await pekerjaanService.dataPekerjaanId(req, res);
    if (pekerjaan.statusCode > 200) {
      return res.redirect(`${baseUrl}/admin/pekerjaan/daftar`);
    }

    const divisi = await divisiService.dataLengkap(req, res);
    const level = await levelService.dataLengkap(req, res);
    return res.render('admin/pekerjaan/ubahPekerjaan', {
      baseUrl,
      req,
      pekerjaan: pekerjaan.data,
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

// ubah data pekerjaan
router.post('/ubah/:id', pekerjaanValidator.ubahPekerjaan, async (req, res) => {
  try {
    const { id } = req.params;
    const baseUrl = getBaseUrl(req);

    const ubahPekerjaan = await pekerjaanService.ubahPekerjaan(req, res);
    if (ubahPekerjaan.statusCode == 404) {
      return res.redirect(`${baseUrl}/admin/pekerjaan/daftar`);
    }
    if (ubahPekerjaan.statusCode > 200) {
      return res.redirect(`${baseUrl}/admin/pekerjaan/ubah/${id}?old_input=true`);
    }

    delete req.session.oldpekerjaan;
    req.session.alert = [{msg: 'Berhasil mengubah data pekerjaan'}];

    return res.redirect(`${baseUrl}/admin/pekerjaan/daftar?idDivisi=${ubahPekerjaan.idDivisi}`);
  } catch (error) {    
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// hapus pekerjaan
router.get('/hapus/:id', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const hapusPekerjaan = await pekerjaanService.hapusPekerjaan(req, res);

    return res.redirect(`${baseUrl}/admin/pekerjaan/daftar?idDivisi=${hapusPekerjaan.idDivisi}`);
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