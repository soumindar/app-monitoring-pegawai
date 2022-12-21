const express = require('express');
const router = express.Router();
const jabatanValidator = require('./jabatanValidator');
const jabatanService = require('./jabatanService');
const getBaseUrl = require('../../../utils/getBaseUrl');
const sessionVerify = require('../auth/sessionVerify');

// router.use(sessionVerify);

// page daftar jabatan
router.get('/daftar', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const jabatan = await jabatanService.dataPagination(req, res);

    return res.render('admin/jabatan/daftarJabatan', {
      baseUrl,
      req,
      data: jabatan.data,
      currentPage: jabatan.currentPage,
      totalPage: jabatan.totalPage,
    });
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// page tambah jabatan
router.get('/tambah', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const { old_input } = req.query;
    if (!old_input) {
      delete req.session.oldJabatan;
    }

    return res.render('admin/jabatan/tambahJabatan', {
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

// tambah jabatan
router.post('/tambah', jabatanValidator.tambahJabatan, async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);

    const tambahJabatan = await jabatanService.tambahJabatan(req, res);
    if (tambahJabatan.statusCode > 200) {
      return res.redirect(`${baseUrl}/admin/jabatan/tambah?old_input=true`);
    }

    delete req.session.oldJabatan;
    req.session.alert = [{msg: 'Berhasil menambah jabatan'}];

    return res.redirect(`${baseUrl}/admin/jabatan/daftar`);
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// page ubah data jabatan
router.get('/ubah/:id', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const { old_input } = req.query;
    if (!old_input) {
      delete req.session.oldJabatan;
    }
    
    const jabatan = await jabatanService.dataJabatanId(req, res);
    if (jabatan.statusCode > 200) {
      return res.redirect(`${baseUrl}/admin/jabatan/daftar`);
    }

    return res.render('admin/jabatan/ubahJabatan', {
      baseUrl,
      req,
      jabatan: jabatan.data,
    });
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// ubah data jabatan
router.post('/ubah/:id', jabatanValidator.tambahJabatan, async (req, res) => {
  try {
    const { id } = req.params;
    const baseUrl = getBaseUrl(req);

    const ubahJabatan = await jabatanService.ubahJabatan(req, res);
    if (ubahJabatan.statusCode == 404) {
      return res.redirect(`${baseUrl}/admin/jabatan/daftar`);
    }
    if (ubahJabatan.statusCode > 200) {
      return res.redirect(`${baseUrl}/admin/jabatan/ubah/${id}?old_input=true`);
    }

    delete req.session.oldJabatan;
    req.session.alert = [{msg: 'Berhasil mengubah data jabatan'}];

    return res.redirect(`${baseUrl}/admin/jabatan/daftar`);
  } catch (error) {
    console.log(error.message);
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// hapus jabatan
router.get('/hapus/:id', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    await jabatanService.hapusJabatan(req, res);

    return res.redirect(`${baseUrl}/admin/jabatan/daftar`);
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