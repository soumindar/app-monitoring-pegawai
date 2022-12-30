const express = require('express');
const router = express.Router();
const adminController = require('../modules/admin');
const userController = require('../modules/user');
const getBaseurl = require('../utils/getBaseUrl');

/* GET home page. */
router.get('/', function(req, res, next) {
  const baseUrl = getBaseurl(req);
  res.redirect(`${baseUrl}/admin/auth/login`);
});

router.use('/admin', adminController);
router.use('/user', userController);

module.exports = router;
