const express = require('express');
const router = express.Router();
const getBaseUrl = require('../../../utils/getBaseUrl');
const sessionVerify = require('../auth/sessionVerify');

router.use(sessionVerify);

// home page user
router.get('/', (req, res) => {
  const baseUrl = getBaseUrl(req);
  return res.render('user/beranda/beranda', {
    baseUrl,
    req,
  });
});

module.exports = router;