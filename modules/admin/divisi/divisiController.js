const express = require('express');
const router = express.Router();
const divisiValidator = require('./divisiValidator');
const divisiService = require('./divisiService');
const getBaseUrl = require('../../../utils/getBaseUrl');
const sessionVerify = require('../auth/sessionVerify');

router.use(sessionVerify);

// page daftar divisi
router.get('/daftar', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const divisi = await divisiService.dataPagination(req, res);

    return res.render('admin/divisi/daftarDivisi', {
      baseUrl,
      req,
      data: divisi.data,
      currentPage: divisi.currentPage,
      totalPage: divisi.totalPage,
    });
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// page tambah divisi
router.get('/tambah', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const { old_input } = req.query;
    if (!old_input) {
      delete req.session.oldDivisi;
    }

    return res.render('admin/divisi/tambahDivisi', {
      baseUrl,
      req,
    });
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// tambah divisi
router.post('/tambah', divisiValidator.tambahDivisi, async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);

    const tambahdivisi = await divisiService.tambahDivisi(req, res);
    if (tambahdivisi.statusCode > 200) {
      return res.redirect(`${baseUrl}/admin/divisi/tambah?old_input=true`);
    }

    delete req.session.oldDivisi;
    req.session.alert = [{msg: 'Berhasil menambah divisi'}];

    return res.redirect(`${baseUrl}/admin/divisi/daftar`);
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// page ubah data divisi
router.get('/ubah/:id', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const { old_input } = req.query;
    if (!old_input) {
      delete req.session.oldDivisi;
    }
    
    const divisi = await divisiService.dataIdParams(req, res);
    if (divisi.statusCode > 200) {
      return res.redirect(`${baseUrl}/admin/divisi/daftar`);
    }

    return res.render('admin/divisi/ubahDivisi', {
      baseUrl,
      req,
      divisi: divisi.data,
    });
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// ubah data divisi
router.post('/ubah/:id', divisiValidator.ubahDivisi, async (req, res) => {
  try {
    const { id } = req.params;
    const baseUrl = getBaseUrl(req);

    const ubahDivisi = await divisiService.ubahDivisi(req, res);
    if (ubahDivisi.statusCode == 404) {
      return res.redirect(`${baseUrl}/admin/divisi/daftar`);
    }
    if (ubahDivisi.statusCode > 200) {
      return res.redirect(`${baseUrl}/admin/divisi/ubah/${id}?old_input=true`);
    }

    delete req.session.oldDivisi;
    req.session.alert = [{msg: 'Berhasil mengubah data divisi'}];

    return res.redirect(`${baseUrl}/admin/divisi/daftar`);
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// hapus divisi
router.get('/hapus/:id', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    await divisiService.hapusDivisi(req, res);

    return res.redirect(`${baseUrl}/admin/divisi/daftar`);
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

module.exports = router;