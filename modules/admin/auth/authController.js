const express = require('express');
const router = express.Router();
const getBaseUrl = require('../../../utils/getBaseUrl');
const authValidator = require('./authValidator');
const authService = require('./authService');
const sessionVerify = require('./sessionVerify');

// halaman login admin
router.get('/login', (req, res) => {
  const baseUrl = getBaseUrl(req);

  return res.render('admin/auth/login', {
    baseUrl,
    req,
  });
});

// login admin
router.post('/login', authValidator.login, async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const auth = await authService.login(req);
    const a  = 5;
    a = 1;
    if (auth.statusCode > 200) {
      req.session.error = auth.message;
      return res.redirect(`${baseUrl}/auth/admin/login`);
    }

    req.session.adminId = auth.adminId;
    return res.redirect(`${baseUrl}/admin/`);
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    req.session.error = [{msg: 'Maaf terjadi kesalahan sistem'}];

    return res.redirect(`${baseUrl}/admin/auth/login`);
  }
});

// logout
router.get('/logout', sessionVerify, async (req, res) => {
  const baseUrl = getBaseUrl(req);
  req.session.destroy();
  
  return res.redirect(`${baseUrl}/auth/admin/login`);
});

module.exports = router;