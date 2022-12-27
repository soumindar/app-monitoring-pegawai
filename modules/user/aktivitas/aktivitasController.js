const express = require('express');
const router = express.Router();
const getBaseUrl = require('../../../utils/getBaseUrl');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const aktivitasValidator = require('./aktivitasValidator');
const aktivitasService = require('./aktivitasService');
const sessionVerify = require('../auth/sessionVerify');

router.use(sessionVerify);

// page daftar aktivitas
router.get('/daftar/:idPegawai', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const aktivitas = await aktivitasService.dataIdPegawai(req, res);
    
    if (aktivitas.statusCode > 200) {
      return res.redirect(`${baseUrl}/user`);
    }

    return res.render('user/aktivitas/daftarAktivitas', {
      baseUrl,
      req,
      data: aktivitas.data,
      currentPage: aktivitas.currentPage,
      totalPage: aktivitas.totalPage,
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

// page tambah aktivitas
router.get('/tambah/:idPegawai', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const { idPegawai } = req.params;
    const { old_input } = req.query;
    if (!old_input) {
      delete req.session.oldAktivitas;
    }

    const pegawai = await prisma.pegawai.findFirst({
      select: {
        nama: true,
        idDivisi: true,
        divisi: true,
      },
      where: {
        id: idPegawai,
        deleted: null,
      }
    });
    if (!pegawai) {
      req.session.error = [{ msg: 'ID pegawai tidak ditemukan' }];
      return res.redirect(`${baseUrl}/user`)
    }

    const pekerjaan = await prisma.pekerjaan.findMany({
      select: {
        id: true,
        pekerjaan: true,
        durasi: true,
        target: true,
        satuanTarget: true,
        idLevel: true,
        level: true,
      },
      where: {
        idDivisi: pegawai.idDivisi,
        deleted: null,
      },
    });

    return res.render('user/aktivitas/tambahAktivitas', {
      baseUrl,
      req,
      namaPegawai: pegawai.nama,
      namaDivisi: pegawai.divisi.divisi,
      pekerjaan,
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

// tambah aktivitas
router.post('/tambah/:idPegawai', aktivitasValidator.tambahAktivitas, async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const { idPegawai } = req.params;
    const tambahAktivitas = await aktivitasService.tambahAktivitas(req, res);
    if (tambahAktivitas.statusCode == 404) {
      return res.redirect(`${baseUrl}/user`);
    }
    if (tambahAktivitas.statusCode > 200) {
      return res.redirect(`${baseUrl}/user/aktivitas/tambah/${idPegawai}`);
    }

    req.session.alert = [{msg: 'Berhasil menambah aktivitas'}];

    return res.redirect(`${baseUrl}/user/aktivitas/daftar/${idPegawai}`);
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('user/error', {
      baseUrl,
      req,
      statusCode: 500,
    });
  }
});

// page tambah realisasi
router.get('/realisasi/:idAktivitas', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);

    const aktivitas = await aktivitasService.dataIdAktivitas(req, res);
    if (aktivitas.statusCode == 404) {
      return res.redirect(`${baseUrl}/user/aktivitas/daftar/${req.session.idPegawai}`);
    }
    
    return res.render('user/aktivitas/tambahRealisasi', {
      baseUrl,
      req,
      aktivitas: aktivitas.data,
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

// tambah realisasi
router.post('/realisasi/:idAktivitas', aktivitasValidator.tambahRealisasi, async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const tambahRealisasi = await aktivitasService.tambahRealisasi(req, res);
    if (tambahRealisasi.statusCode > 200) {
      return res.redirect(`${baseUrl}/user/aktivitas/daftar/${req.session.idPegawai}`);
    }

    req.session.alert =[{msg: 'Isi realisasi berhasil'}];

    return res.redirect(`${baseUrl}/user/aktivitas/daftar/${req.session.idPegawai}`);
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