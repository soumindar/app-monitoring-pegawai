const express = require('express');
const router = express.Router();
const getBaseUrl = require('../../../utils/getBaseUrl');
const ckpValidator = require('./ckpValidator');
const ckpService = require('./ckpService');
const sessionVerify = require('../auth/sessionVerify');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.use(sessionVerify);

// page daftar ckp keseluruhan
router.get('/daftar', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const { idDivisi } = req.query;
    let data = {};

    if (idDivisi) {
      data = await ckpService.daftarCkp(req, res);
    }
    
    const divisi = await prisma.divisi.findMany({
      select: {
        id: true,
        divisi: true,
      },
      where: { deleted: null },
    });

    return res.render('admin/ckpDivisi/daftarCkp', {
      baseUrl,
      req,
      divisi,
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
    const divisi = await prisma.divisi.findMany({
      select: {
        id: true,
        divisi: true,
      },
      where: { deleted: null },
    });

    return res.render('admin/ckpDivisi/tambahCkp', {
      baseUrl,
      req,
      divisi,
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
    await ckpService.tambahCkp(req, res);

    return res.redirect(`${baseUrl}/admin/ckp-divisi/daftar?idDivisi=${req.body.idDivisi}&tahun=${req.body.tahun}`);
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

module.exports = router;