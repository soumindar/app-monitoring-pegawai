const express = require('express');
const router = express.Router();
const levelValidator = require('./levelValidator');
const levelService = require('./levelService');
const getBaseUrl = require('../../../utils/getBaseUrl');
const sessionVerify = require('../auth/sessionVerify');

// router.use(sessionVerify);

// page daftar level
router.get('/daftar', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const level = await levelService.dataPagination(req, res);
    
    return res.render('admin/level/daftarLevel', {
      baseUrl,
      req,
      data: level.data,
      currentPage: level.currentPage,
      totalPage: level.totalPage,
    })
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// page ubah data level
router.get('/ubah/:id', async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const { old_input } = req.query;
    if (!old_input) {
      delete req.session.oldlevel;
    }
    
    const level = await levelService.dataIdParams(req, res);
    if (level.statusCode > 200) {
      return res.redirect(`${baseUrl}/admin/level/daftar`);
    }

    return res.render('admin/level/ubahLevel', {
      baseUrl,
      req,
      level: level.data,
    });
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

// ubah data level
router.post('/ubah/:id', levelValidator.ubahLevel, async (req, res) => {
  try {
    const { id } = req.params;
    const baseUrl = getBaseUrl(req);

    const ubahLevel = await levelService.ubahLevel(req, res);
    if (ubahLevel.statusCode == 404) {
      return res.redirect(`${baseUrl}/admin/level/daftar`);
    }
    if (ubahLevel.statusCode > 200) {
      return res.redirect(`${baseUrl}/admin/level/ubah/${id}?old_input=true`);
    }

    delete req.session.oldlevel;
    req.session.alert = [{msg: 'Berhasil mengubah data level'}];

    return res.redirect(`${baseUrl}/admin/level/daftar`);
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
});

module.exports = router;