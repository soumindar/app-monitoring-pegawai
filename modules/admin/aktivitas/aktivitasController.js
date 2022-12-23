const express = require('express');
const router = express.Router();
const momentTz = require('moment-timezone');
const userTimezone = require('../../../config/timezone.config');
const getBaseUrl = require('../../../utils/getBaseUrl');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const aktivitasValidator = require('./aktivitasValidator');
const aktivitasService = require('./aktivitasService');
const pegawaiService = require('../pegawai/pegawaiService');
const jabatanService = require('../jabatan/jabatanService');
const divisiService = require('../divisi/divisiService');
const sessionVerify = require('../auth/sessionVerify');

// router.use(sessionVerify);

// page daftar pegawai
router.get('/pegawai', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const pegawai = await pegawaiService.aktivitasPegawai(req, res);
    const jabatan = await jabatanService.dataLengkap(req, res);
    const divisi = await divisiService.dataLengkap(req, res);

    return res.render('admin/aktivitas/daftarPegawai', {
      baseUrl,
      req,
      data: pegawai.data,
      currentPage: pegawai.currentPage,
      totalPage: pegawai.totalPage,
      jabatan: jabatan.data,
      divisi: divisi.data,
    });
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// page daftar aktivitas
router.get('/pegawai/daftar/:idPegawai', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const aktivitas = await aktivitasService.dataIdPegawai(req, res);
    
    if (aktivitas.statusCode > 200) {
      return res.redirect(`${baseUrl}/admin/aktivitas/pegawai`);
    }

    return res.render('admin/aktivitas/daftarAktivitas', {
      baseUrl,
      req,
      data: aktivitas.data,
      currentPage: aktivitas.currentPage,
      totalPage: aktivitas.totalPage,
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

// page tambah aktivitas
router.get('/pegawai/tambah/:idPegawai', async (req, res) => {
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
      return res.redirect(`${baseUrl}/admin/aktivitas/pegawai`)
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

    return res.render('admin/aktivitas/tambahAktivitas', {
      baseUrl,
      req,
      namaPegawai: pegawai.nama,
      namaDivisi: pegawai.divisi.divisi,
      pekerjaan,
    });
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// tambah aktivitas
router.post('/pegawai/tambah/:idPegawai', aktivitasValidator.tambahAktivitas, async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const { idPegawai } = req.params;
    const tambahAktivitas = await aktivitasService.tambahAktivitas(req, res);
    if (tambahAktivitas.statusCode == 404) {
      return res.redirect(`${baseUrl}/admin/aktivitas/pegawai`);
    }
    if (tambahAktivitas.statusCode > 200) {
      return res.redirect(`${baseUrl}/admin/aktivitas/pegawai/tambah/${idPegawai}`);
    }

    req.session.alert = [{msg: 'Berhasil menambah aktivitas'}];

    return res.redirect(`${baseUrl}/admin/aktivitas/pegawai/${idPegawai}`);
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// page tambah realisasi
router.get('/pegawai/realisasi/:idAktivitas', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);

    const aktivitas = await aktivitasService.dataIdAktivitas(req, res);
    if (aktivitas.statusCode == 404) {
      return res.redirect(`${baseUrl}/admin/aktivitas/pegawai`);
    }
    
    return res.render('admin/aktivitas/tambahRealisasi', {
      baseUrl,
      req,
      aktivitas: aktivitas.data,
    });
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// tambah realisasi
router.post('/pegawai/realisasi/:idAktivitas', aktivitasValidator.tambahRealisasi, async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const tambahRealisasi = await aktivitasService.tambahRealisasi(req, res);
    if (tambahRealisasi.statusCode == 404) {
      return res.redirect(`${baseUrl}/admin/aktivitas/pegawai`);
    }
    if (tambahRealisasi.statusCode > 200) {
      return res.redirect(`${baseUrl}/admin/aktivitas/pegawai/${tambahRealisasi.idPegawai}`);
    }

    req.session.alert =[{msg: 'Isi realisasi berhasil'}];

    return res.redirect(`${baseUrl}/admin/aktivitas/pegawai/${tambahRealisasi.idPegawai}`);
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// page ubah aktivitas
router.get('/pegawai/ubah/:idAktivitas', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const { idAktivitas } = req.params;
    const { old_input } = req.query;
    if (!old_input) {
      delete req.session.oldAktivitas;
    }

    const aktivitas = await aktivitasService.dataIdAktivitas(req, res);
    if (aktivitas.statusCode > 200) {
      return res.redirect(`${baseUrl}/admin/aktivitas/pegawai`)
    }

    return res.render('admin/aktivitas/ubahAktivitas', {
      baseUrl,
      req,
      aktivitas: aktivitas.data,
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

// ubah aktivitas
router.post('/pegawai/ubah/:idAktivitas', aktivitasValidator.ubahAktivitas, async (req, res) => {
  try{
    const baseUrl = getBaseUrl(req);
    const ubahAktivitas = await aktivitasService.ubahAktivitas(req, res);
    if (ubahAktivitas > 200) {
      return res.redirect(`${baseUrl}/admin/aktivitas/pegawai`);
    }

    req.session.alert = [{msg: 'Data aktivitas berhasil diubah'}];

    return res.redirect(`${baseUrl}/admin/aktivitas/pegawai/daftar/${ubahAktivitas.idPegawai}`);
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

module.exports = router;