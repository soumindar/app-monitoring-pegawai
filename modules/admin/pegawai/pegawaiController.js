const express = require('express');
const router = express.Router();
const pegawaiValidator = require('./pegawaiValidator');
const pegawaiService = require('./pegawaiService');
const jabatanService = require('../jabatan/jabatanService');
const divisiService = require('../divisi/divisiService');
const getBaseUrl = require('../../../utils/getBaseUrl');
const sessionVerify = require('../auth/sessionVerify');

// router.use(sessionVerify);

// page daftar pegawai
router.get('/daftar', async (req, res) => {
  const baseUrl = getBaseUrl(req);
  const dataPegawai = await pegawaiService.dataPegawai(req, res);

  return res.render('admin/pegawai/daftarPegawai', {
    baseUrl,
    req,
    data: dataPegawai.data,
    currentPage: dataPegawai.currentPage,
    totalPage: dataPegawai.totalPage,
  });
});

// page tambah pegawai
router.get('/tambah', async (req, res) => {
  const baseUrl = getBaseUrl(req);
  const { old_input } = req.query;
  if (!old_input) {
    delete req.session.oldPegawai;
  }

  const jabatan = await jabatanService.ambilData(req);
  const divisi = await divisiService.ambilData(req, res);
  return res.render('admin/pegawai/tambahPegawai', {
    baseUrl,
    req,
    jabatan: jabatan.data,
    divisi: divisi.data,
  });
});

// tambah pegawai
router.post('/tambah', pegawaiValidator.tambahPegawai, async (req, res) => {
  const baseUrl = getBaseUrl(req);
  const tambahPegawai = await pegawaiService.tambahPegawai(req, res);
  if (tambahPegawai.statusCode > 200) {
    return res.redirect(`${baseUrl}/admin/pegawai/tambah?old_input=true`);
  }

  delete req.session.oldPegawai;
  req.session.alert = [{msg: 'Berhasil menambah pegawai'}];

  return res.redirect(`${baseUrl}/admin/pegawai/tambah`);
});

module.exports = router;