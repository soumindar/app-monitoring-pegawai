const express = require('express');
const router = express.Router();
const getBaseUrl = require('../../../utils/getBaseUrl');
const ckpService = require('./ckpService');
const pegawaiService = require('../pegawai/pegawaiService');
const sessionVerify = require('../auth/sessionVerify');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.use(sessionVerify);

// page daftar pegawai
router.get('/pegawai', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const pegawai = await pegawaiService.dataPegawai(req, res);

    return res.render('admin/ckpPegawai/daftarPegawai', {
      baseUrl,
      req,
      data: pegawai.data,
      currentPage: pegawai.currentPage,
      totalPage: pegawai.totalPage,
    });
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});


// page daftar ckp keseluruhan
router.get('/daftar/:idPegawai', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const { idPegawai } = req.params;

    const idExist = await prisma.pegawai.findFirst({
      select: { id: true },
      where: { id: idPegawai },
    });
    if (!idExist) {
      return res.redirect(`${baseUrl}/admin/ckp-pegawai/pegawai`);
    }
    
    data = await ckpService.daftarCkp(req, res);

    return res.render('admin/ckpPegawai/daftarCkp', {
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

module.exports = router;