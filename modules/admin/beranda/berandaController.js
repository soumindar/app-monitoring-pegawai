const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require('express');
const router = express.Router();
const getBaseUrl = require('../../../utils/getBaseUrl');
const sessionVerify = require('../auth/sessionVerify');
const berandaService = require('./berandaService');

router.use(sessionVerify);

// home page admin
router.get('/', async (req, res) => {
  const baseUrl = getBaseUrl(req);
  console.log(req.query);
  const data = await berandaService.dataBeranda(req, res);

  return res.render('admin/beranda/beranda', {
    baseUrl,
    req,
    // divisi: data.divisi,
    jmlPegawai: data.jmlPegawai,
    jmlAktivitas: data.jmlAktivitas,
    progressCkp: data.progressCkp,
    realisasiKosong: data.realisasiKosong,
    ckpKeseluruhan: JSON.stringify(data.ckpKeseluruhan),
    distribusiPegawai: JSON.stringify(data.distribusiPegawai),
    progressCkpDivisi: JSON.stringify(data.progressCkpDivisi),
    // pegawaiKosong: data.pegawaiKosong,
  });
});

// grafik ckp keseluruhan
router.get('/grafik-ckp-keseluruhan', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const data = await berandaService.ckpKeseluruhan(req, res);
    console.log(data);
    return res.render('admin/beranda/grafikCkpKeseluruhan', {
      baseUrl,
      req,
      ckpKeseluruhan: JSON.stringify(data.ckpKeseluruhan),
    });
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// grafik ckp per divisi
router.get('/grafik-ckp-per-divisi', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const data = await berandaService.ckpPerDivisi(req, res);
    
    return res.render('admin/beranda/grafikCkpPerDivisi', {
      baseUrl,
      req,
      ckpPerDivisi: JSON.stringify(data.ckpPerDivisi),
    });
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// grafik ckp divisi
router.get('/grafik-ckp-divisi', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    
    const divisi = await prisma.divisi.findMany({
      select: {
        id: true,
        divisi: true,
      },
      where: { deleted: null },
    });

    const data = await berandaService.ckpDivisi(req, res);

    return res.render('admin/beranda/grafikCkpDivisi', {
      baseUrl,
      req,
      divisi,
      namaDivisi: data.namaDivisi,
      ckpDivisi: JSON.stringify(data.ckpDivisi),
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