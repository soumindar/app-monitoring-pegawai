const express = require('express');
const router = express.Router();
const getBaseUrl = require('../../../utils/getBaseUrl');
const sessionVerify = require('../auth/sessionVerify');
const berandaService = require('./berandaService');

router.use(sessionVerify);

// home page admin
router.get('/', async (req, res) => {
  const baseUrl = getBaseUrl(req);
  const data = await berandaService.dataBeranda(req, res);

  return res.render('admin/beranda/beranda', {
    baseUrl,
    req,
    divisi: data.divisi,
    jmlPegawai: data.jmlPegawai,
    jmlAktivitas: data.jmlAktivitas,
    progressCkp: data.progressCkp,
    realisasiKosong: data.realisasiKosong,
    distribusiPegawai: JSON.stringify(data.distribusiPegawai),
    ckpKeseluruhan: JSON.stringify(data.ckpKeseluruhan),
    ckpDivisi: JSON.stringify(data.ckpDivisi),
    pegawaiKosong: data.pegawaiKosong,
  });
});

module.exports = router;