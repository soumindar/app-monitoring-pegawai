const { check, validationResult } = require('express-validator');
const getBaseUrl = require('../../../utils/getBaseUrl');

// login validator
const login = [
  check('username').notEmpty().withMessage('Username tidak boleh kosong!'),
  check('username').isAlphanumeric().withMessage('Username hanya boleh mengandung alfabet dan angka!'),
  check('username').isLength({min: 3}).withMessage('Username minimal terdiri dari 3 karakter!'),
  check('password').notEmpty().withMessage('Password tidak boleh kosong!'),
  check('password').isLength({min: 6}).withMessage('Password minimal terdiri dari 6 karakter!'),
  (req, res, next) => {
    const errors = validationResult(req).array();
    
    if (errors.length > 0) {
      const { username } = req.body;
      const baseUrl = getBaseUrl(req);
      req.session.oldAuth = { username };
      req.session.error = errors;
      
      return res.redirect(`${baseUrl}/user/auth/login`);
    }

    next();
  }
];

module.exports = {
  login,
};