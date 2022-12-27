const express = require('express');
const router = express.Router();
const adminValidator = require('./userAdminValidator');
const adminService = require('./userAdminService');
const getBaseUrl = require('../../../utils/getBaseUrl');
const sessionVerify = require('../auth/sessionVerify');

router.use(sessionVerify);

// page daftar admin
router.get('/daftar', async (req, res) => {
  try {
    const userAdmin = await adminService.dataAdmin(req, res);
    const baseUrl = getBaseUrl(req); 
    return res.render('admin/userAdmin/daftarAdmin', {
      baseUrl,
      req,
      data: userAdmin.data,
      currentPage: userAdmin.currentPage,
      totalPage: userAdmin.totalPage,
    });
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// ambil data admin berdasarkan id
router.get('/id/:id', adminService.dataAdminIdApi);

// page tambah admin
router.get('/tambah', (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const { old_input } = req.query;
    if (!old_input) {
      delete req.session.oldAdmin;
    }

    return res.render('admin/userAdmin/tambahAdmin', {
      baseUrl,
      req,
    });
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// tambah admin
router.post('/tambah', adminValidator.tambahAdmin, async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const tambahAdmin = await adminService.tambahAdmin(req, res);

    if (tambahAdmin.statusCode > 200) {
      return res.redirect(`${baseUrl}/admin/user-admin/tambah?old_input=true`);
    }

    delete req.session.old;

    return res.redirect(`${baseUrl}/admin/user-admin/daftar`);
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// page ubah data admin
router.get('/ubah/:id', async (req, res) => {
  try{
    const baseUrl = getBaseUrl(req);
    const { old_input } = req.query;
    if (!old_input) {
      delete req.session.oldAdmin;
    }
    
    const userAdmin = await adminService.dataAdminId(req, res);
    if (userAdmin.statusCode > 200) {
      return res.redirect(`${baseUrl}/admin/user-admin/daftar`);
    }
    
    return res.render('admin/userAdmin/ubahAdmin', {
      baseUrl,
      req,
      admin: userAdmin.data,
    });
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// ubah data admin
router.post('/ubah/:id', adminValidator.ubahAdmin, async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const { id } = req.params;

    const ubahAdmin = await adminService.ubahAdmin(req);
    if (ubahAdmin.statusCode == 404) {
      return res.redirect(`${baseUrl}/admin/user-admin/daftar`);
    }
    if (ubahAdmin.statusCode > 200) {
      return res.redirect(`${baseUrl}/admin/user-admin/ubah/${id}?old_input=true`);
    }

    return res.redirect(`${baseUrl}/admin/user-admin/daftar`);
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

    return res.render('admin/userAdmin/ubahPassword', {
      baseUrl,
      req,
    });
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// ubah password
router.post('/ubah-password/:id', adminValidator.ubahPassword, async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const ubahPassword = await adminService.ubahPassword(req);

    if (ubahPassword.statusCode == 404) {
      return res.redirect(`${baseUrl}/admin/user-admin/daftar`);
    }
    if (ubahPassword.statusCode > 200) {
      const { id } = req.params;
      return res.redirect(`${baseUrl}/admin/user-admin/ubah-password/${id}?old_input=true`);
    }

    return res.redirect(`${baseUrl}/admin/user-admin/daftar`);
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// hapus admin
router.get('/hapus/:id', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const hapusAdmin = await adminService.hapusAdmin(req);
    
    return res.redirect(`${baseUrl}/admin/user-admin/daftar`);
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

module.exports = router;