const express = require('express');
const router = express.Router();
const getBaseUrl = require('../../../utils/getBaseUrl');
const sessionVerify = require('../auth/sessionVerify');

router.use(sessionVerify);

// home page admin
router.get('/', (req, res) => {
  const baseUrl = getBaseUrl(req);
  return res.render('admin/beranda/beranda', {
    baseUrl,
    req,
  });
});

module.exports = router;