const express = require('express');
const router = express.Router();
const adminController = require('../modules/admin/');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/admin', adminController);

module.exports = router;
