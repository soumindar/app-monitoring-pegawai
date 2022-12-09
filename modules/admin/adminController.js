const express = require('express');
const router = express.Router();
const adminValidator = require('./adminValidator');
const adminService = require('./adminService');
const getBaseUrl = require('../../utils/getBaseUrl');
const sessionVerify = require('./auth/sessionVerify');

// router.use(sessionVerify);

// admin home page
router.get('/', (req, res) => {
  const baseUrl = getBaseUrl(req);
  
  return res.render('admin/index', {
    baseUrl,
  });
});

// admin list page
router.get('/daftar', async (req, res) => {
  try {
    const getData = await adminService.dataAdmin(req);
    const baseUrl = getBaseUrl(req);
    const alerts = [];

    return res.render('admin/daftarAdmin', {
      baseUrl,
      data: getData.data,
      currentPage: getData.currentPage,
      totalPage: getData.totalPage,
      alerts,
    });
  } catch (error) {
    return res.render('error', {
      baseUrl,
      statusCode: getData.statusCode,
    });
  }
});

// create admin page
router.get('/tambah', (req, res) => {
  const baseUrl = getBaseUrl(req);
  let errors = [];
  delete req.session.old;

  return res.render('admin/tambahAdmin', {
    baseUrl,
    req,
    errors,
  });
});

// create admin
router.post('/tambah', adminValidator.tambahAdmin, async (req, res) => {
  const baseUrl = getBaseUrl(req);

  const create = await adminService.tambahAdmin(req);  

  return res.render('admin/tambahAdmin', {
    baseUrl,
    req,
  });
});

// delete admin
// router.delete('/hapus/:id', adminValidator)

module.exports = router;