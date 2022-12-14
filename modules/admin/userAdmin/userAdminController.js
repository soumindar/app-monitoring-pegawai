const express = require('express');
const router = express.Router();
const adminValidator = require('./userAdminValidator');
const adminService = require('./userAdminService');
const getBaseUrl = require('../../../utils/getBaseUrl');
const sessionVerify = require('../auth/sessionVerify');

// router.use(sessionVerify);

// page daftar admin
router.get('/daftar', async (req, res) => {
  try {
    const getData = await adminService.dataAdmin(req);
    const baseUrl = getBaseUrl(req); 
    return res.render('admin/daftarAdmin', {
      baseUrl,
      req,
      data: getData.data,
      currentPage: getData.currentPage,
      totalPage: getData.totalPage,
    });
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// page tambah admin
router.get('/tambah', (req, res) => {
  const baseUrl = getBaseUrl(req);
  return res.render('admin/tambahAdmin', {
    baseUrl,
    req,
  });
});

// tambah admin
router.post('/tambah', adminValidator.tambahAdmin, async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const create = await adminService.tambahAdmin(req);

    if (create.statusCode > 200) {
      return res.redirect(`${baseUrl}/admin/tambah`);
    }

    delete req.session.old;
    return res.redirect(`${baseUrl}/admin/tambah`);
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// page edit admin
router.get('/edit/:id', async (req, res) => {
  const baseUrl = getBaseUrl(req);
  const data = await adminService.dataIdAdmin(req);
  
  return res.render('admin/editAdmin', {
    baseUrl,
    req,
    data: data.data,
  });
});

// edit data admin
router.post('/edit/:id', adminValidator.editAdmin, async (req, res) => {
  try {
    const editAdmin = await adminService.editAdmin(req);
    const baseUrl = getBaseUrl(req);

    if (editAdmin.statusCode > 200) {
      const { id } = req.params;
      return res.redirect(`${baseUrl}/admin/edit/${id}`);
    }

    return res.redirect(`${baseUrl}/admin/daftar`);
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
  const baseUrl = getBaseUrl(req);
  return res.render('admin/ubahPassword', {
    baseUrl,
    req,
  });
});

// ubah password
router.post('/ubah-password/:id', adminValidator.ubahPass, async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const ubahPass = await adminService.ubahPass(req);

    if (ubahPass.statusCode > 200) {
      const { id } = req.params;
      return res.redirect(`${baseUrl}/admin/ubah-password/${id}`);
    }

    return res.redirect(`${baseUrl}/admin/daftar`);
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
    
    if (hapusAdmin.statusCode > 200) {
      return res.redirect(`${baseUrl}/admin/daftar`)
    }

    return res.redirect(`${baseUrl}/admin/daftar`);
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

module.exports = router;