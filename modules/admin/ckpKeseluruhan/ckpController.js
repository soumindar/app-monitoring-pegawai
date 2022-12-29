const express = require('express');
const router = express.Router();
const getBaseUrl = require('../../../utils/getBaseUrl');
const ckpValidator = require('./ckpValidator');
const ckpService = require('./ckpService');
const sessionVerify = require('../auth/sessionVerify');

router.use(sessionVerify);

// page daftar ckp keseluruhan
router.get('/daftar', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const data = await ckpService.daftarCkp(req, res);

    return res.render('admin/ckpKeseluruhan/daftarCkp', {
      baseUrl,
      req,
      tahun: data.tahun,
      dataTahunanExist: data.dataTahunanExist,
      dataBulananExist: data.dataBulananExist,
      ckpTahunan: data.ckpTahunan,
      ckpBulanan: data.ckpBulanan,
    });
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// page tambah ckp
router.get('/tambah', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/ckpKeseluruhan/tambahCkp', {
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

// tambah ckp
router.post('/tambah', ckpValidator.tambahCkp, async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const tambahCkp = await ckpService.tambahCkp(req, res);

    return res.redirect(`${baseUrl}/admin/ckp-keseluruhan/daftar?tahun=${req.body.tahun}`);
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

module.exports = router;