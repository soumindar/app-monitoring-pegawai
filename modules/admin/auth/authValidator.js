const { check, validationResult } = require('express-validator');

// login validator
const login = [
  check('username').notEmpty().withMessage('username tidak boleh kosong'),
  check('password').notEmpty().withMessage('password tidak boleh kosong'),
  check('username').isLength({min: 3}).withMessage('username minimal terdiri dari 3 karakter'),
  check('password').isLength({min: 6}).withMessage('password minimal terdiri dari 6 karakter'),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array(),
        statusCode: 400
      });
    }

    next();
  }
];

module.exports = {
  login,
};