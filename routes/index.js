const express = require('express');
const router = express.Router();
const adminController = require('../modules/admin/adminController');
const authAdminController = require('../modules/admin/auth/authController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/auth/admin', authAdminController);
router.use('/admin', adminController);

module.exports = router;
