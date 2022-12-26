const express = require('express');
const router = express.Router();
const adminController = require('../modules/admin');
const userController = require('../modules/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/admin', adminController);
router.use('/user', userController);

module.exports = router;
