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
  try {
    const baseUrl = getBaseUrl(req);
    const pegawai = await pegawaiService.dataPegawai(req, res);
    const jabatan = await jabatanService.dataLengkap(req, res);
    const divisi = await divisiService.dataDivisi(req, res);

    return res.render('admin/pegawai/daftarPegawai', {
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

// page tambah pegawai
router.get('/tambah', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const { old_input } = req.query;
    if (!old_input) {
      delete req.session.oldPegawai;
    }

    const jabatan = await jabatanService.dataLengkap(req, res);
    const divisi = await divisiService.dataDivisi(req, res);
    return res.render('admin/pegawai/tambahPegawai', {
      baseUrl,
      req,
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

// tambah pegawai
router.post('/tambah', pegawaiValidator.tambahPegawai, async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);

    const tambahPegawai = await pegawaiService.tambahPegawai(req, res);
    if (tambahPegawai.statusCode > 200) {
      return res.redirect(`${baseUrl}/admin/pegawai/tambah?old_input=true`);
    }

    delete req.session.oldPegawai;
    req.session.alert = [{msg: 'Berhasil menambah pegawai'}];

    return res.redirect(`${baseUrl}/admin/pegawai/daftar`);
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// page ubah data pegawai
router.get('/ubah/:id/', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const { old_input } = req.query;
    if (!old_input) {
      delete req.session.oldPegawai;
    }

    const pegawai = await pegawaiService.dataPegawaiId(req, res);
    if (pegawai.statusCode > 200) {
      return res.redirect(`${baseUrl}/admin/pegawai/daftar`);
    }

    const jabatan = await jabatanService.dataLengkap(req, res);
    const divisi = await divisiService.dataDivisi(req, res);
    return res.render('admin/pegawai/ubahPegawai', {
      baseUrl,
      req,
      pegawai: pegawai.data,
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

// ubah data pegawai
router.post('/ubah/:id', pegawaiValidator.ubahPegawai, async (req, res) => {
  try {
    const { id } = req.params;
    const baseUrl = getBaseUrl(req);

    const ubahPegawai = await pegawaiService.ubahPegawai(req, res);
    if (ubahPegawai.statusCode == 404) {
      return res.redirect(`${baseUrl}/admin/pegawai/daftar`);
    }
    if (ubahPegawai.statusCode > 200) {
      return res.redirect(`${baseUrl}/admin/pegawai/ubah/${id}?old_input=true`);
    }

    delete req.session.oldPegawai;
    req.session.alert = [{msg: 'Berhasil mengubah data pegawai'}];

    return res.redirect(`${baseUrl}/admin/pegawai/daftar`);
  } catch (error) {    
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// page ubah password
router.get('/ubah-password/:id', (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/pegawai/ubahPassword', {
      baseUrl,
      req,
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

// ubah password
router.post('/ubah-password/:id', pegawaiValidator.ubahPassword, async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const ubahPassword = await pegawaiService.ubahPassword(req, res);
    
    if (ubahPassword.statusCode == 404) {
      return res.redirect(`${baseUrl}/admin/pegawai/daftar`);
    }
    if (ubahPassword.statusCode > 200) {
      const { id } = req.params;
      return res.redirect(`${baseUrl}/admin/pegawai/ubah-password/${id}`);
    }

    return res.redirect(`${baseUrl}/admin/pegawai/daftar`);
  } catch (error) {
    console.log(error.message);
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// hapus pegawai
router.get('/hapus/:id', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    await pegawaiService.hapusPegawai(req, res);

    return res.redirect(`${baseUrl}/admin/pegawai/daftar`);
  } catch (error) {
    console.log(error.message);
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
})
module.exports = router;