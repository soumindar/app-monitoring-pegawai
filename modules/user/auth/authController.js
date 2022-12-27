const express = require('express');
const router = express.Router();
const getBaseUrl = require('../../../utils/getBaseUrl');
const authValidator = require('./authValidator');
const authService = require('./authService');
const sessionVerify = require('./sessionVerify');

// halaman login user
router.get('/login', (req, res) => {
  const baseUrl = getBaseUrl(req);

  return res.render('user/auth/login', {
    baseUrl,
    req,
  });
});

// login user
router.post('/login', authValidator.login, async (req, res) => {
  try {
    const baseUrl = getBaseUrl(req);
    const auth = await authService.login(req);
    
    if (auth.statusCode > 200) {
      return res.redirect(`${baseUrl}/user/auth/login`);
    }

    req.session.idPegawai = auth.idPegawai;
    return res.redirect(`${baseUrl}/user`);
  } catch (error) {
    console.log(error.message);
    const baseUrl = getBaseUrl(req);
    req.session.error = [{msg: 'Maaf terjadi kesalahan sistem'}];

    return res.redirect(`${baseUrl}/user/auth/login`);
  }
});

// logout
router.get('/logout', sessionVerify, async (req, res) => {
  const baseUrl = getBaseUrl(req);
  req.session.destroy();
  
  return res.redirect(`${baseUrl}/user/auth/login`);
});

module.exports = router;