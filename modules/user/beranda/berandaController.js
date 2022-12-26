const express = require('express');
const router = express.Router();
const getBaseUrl = require('../../../utils/getBaseUrl');
const sessionVerify = require('../auth/sessionVerify');
const berandaService = require('./berandaService');

router.use(sessionVerify);

// home page user
router.get('/', async (req, res) => {
  const baseUrl = getBaseUrl(req);
  const pegawai = await berandaService.dataBeranda(req, res);
  
  return res.render('user/beranda/beranda', {
    baseUrl,
    req,
    data: pegawai.data,
  });
});

module.exports = router;