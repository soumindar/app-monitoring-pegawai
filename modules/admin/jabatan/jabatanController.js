const express = require('express');
const router = express.Router();
const jabatanService = require('../jabatan/jabatanService');
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
    console.log(error.message);
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

module.exports = router;