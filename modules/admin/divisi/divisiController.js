const express = require('express');
const router = express.Router();
const divisiValidator = require('./divisiValidator');
const divisiService = require('./divisiService');
const getBaseUrl = require('../../../utils/getBaseUrl');
const sessionVerify = require('../auth/sessionVerify');

// router.use(sessionVerify);

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

module.exports = router;