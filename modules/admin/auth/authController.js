const express = require('express');
const router = express.Router();
const getBaseUrl = require('../../../utils/getBaseUrl');
const authService = require('./authService');
const sessionVerify = require('./sessionVerify');

// halaman login admin
router.get('/login', (req, res) => {
  const baseUrl = getBaseUrl(req);

  return res.render('admin/login', {
    baseUrl: baseUrl,
    req: req,
  });
});

// login admin
router.post('/login', async (req, res) => {
  const baseUrl = getBaseUrl(req);
  const auth = await authService.login(req);

  if (auth.statusCode > 200) {
    req.session.error = auth.message;
    return res.redirect(`${baseUrl}/auth/admin/login`);
  }

  req.session.adminId = auth.adminId;
  return res.redirect(`${baseUrl}/admin/`);
});

// logout
router.get('/logout', sessionVerify, async (req, res) => {
  req.session.destroy();
  console.log(req.session);

  const baseUrl = getBaseUrl(req);
  return res.redirect(`${baseUrl}/auth/admin/login`);
});

module.exports = router;