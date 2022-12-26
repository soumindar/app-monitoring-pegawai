const express = require('express');
const router = express.Router();
const pegawaiValidator = require('./pegawaiValidator');
const pegawaiService = require('./pegawaiService');
const getBaseUrl = require('../../../utils/getBaseUrl');
const sessionVerify = require('../auth/sessionVerify');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.use(sessionVerify);

// page ubah data pegawai
router.get('/ubah/:id', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const { old_input } = req.query;
    if (!old_input) {
      delete req.session.oldPegawai;
    }

    const pegawai = await pegawaiService.dataPegawaiId(req, res);
    if (pegawai.statusCode > 200) {
      return res.redirect(`${baseUrl}/user/pegawai/daftar`);
    }

    const jabatan = await prisma.jabatan.findMany({
      select: {
        id: true,
        jabatan: true,
      },
      where: {
        deleted: null
      },
    });

    const divisi = await prisma.divisi.findMany({
      select: {
        id: true,
        divisi: true,
      },
      where: {
        deleted: null
      },
    });

    return res.render('user/pegawai/ubahPegawai', {
      baseUrl,
      req,
      pegawai: pegawai.data,
      jabatan,
      divisi,
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

// ubah data pegawai
router.post('/ubah/:id', pegawaiValidator.ubahPegawai, async (req, res) => {
  try {
    const { id } = req.params;
    const baseUrl = getBaseUrl(req);

    const ubahPegawai = await pegawaiService.ubahPegawai(req, res);
    if (ubahPegawai.statusCode == 404) {
      return res.redirect(`${baseUrl}/user`);
    }
    if (ubahPegawai.statusCode > 200) {
      return res.redirect(`${baseUrl}/user/pegawai/ubah/${id}?old_input=true`);
    }

    delete req.session.oldPegawai;
    req.session.alert = [{msg: 'Berhasil mengubah data pegawai'}];

    return res.redirect(`${baseUrl}/user`);
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('user/error', {
      baseUrl,
      req,
      statusCode: 500,
    });
  }
});

// page ubah password
router.get('/ubah-password/:id', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);

    return res.render('user/pegawai/ubahPassword', {
      baseUrl,
      req,
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

// ubah password
router.post('/ubah-password/:id', pegawaiValidator.ubahPassword, async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const ubahPassword = await pegawaiService.ubahPassword(req, res);
    
    if (ubahPassword.statusCode == 404) {
      return res.redirect(`${baseUrl}/user`);
    }
    if (ubahPassword.statusCode > 200) {
      const { id } = req.params;
      return res.redirect(`${baseUrl}/user/pegawai/ubah-password/${id}`);
    }

    return res.redirect(`${baseUrl}/user`);
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