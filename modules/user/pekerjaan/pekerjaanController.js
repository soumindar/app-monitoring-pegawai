const express = require('express');
const router = express.Router();
const pekerjaanValidator = require('./pekerjaanValidator');
const pekerjaanService = require('./pekerjaanService');
const getBaseUrl = require('../../../utils/getBaseUrl');
const sessionVerify = require('../auth/sessionVerify');
const pegawaiService = require('../pegawai/pegawaiService');

router.use(sessionVerify);

// page daftar pekerjaan
router.get('/daftar/:id', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const { id } = req.params;

    const pegawai = await pegawaiService.dataPegawaiId(req, res);
    if (pegawai.statusCode > 200) {
      return res.redirect(`${baseUrl}/user`);
    }
    const idDivisi = pegawai.data.idDivisi;
    req.query.idDivisi = idDivisi;
    
    let data = [];
    let currentPage = 1;
    let totalPage = 1;

    const pekerjaan = await pekerjaanService.dataPekerjaanDivisi(req, res);
    if (pekerjaan.statusCode == 200) {
      data = pekerjaan.data;
      currentPage = pekerjaan.currentPage;
      totalPage = pekerjaan.totalPage;
    }

    return res.render('user/pekerjaan/daftarPekerjaan', {
      baseUrl,
      req,
      data,
      currentPage,
      totalPage,
    });
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('user/error', {
      baseUrl,
      req,
      statusCode: 500,
    });
  }
});

module.exports = router;