const { check, validationResult } = require('express-validator');
const getBaseUrl = require('../../../utils/getBaseUrl');

// validator tambah admin
const tambahAdmin = [
  check('nama').notEmpty().withMessage('Nama tidak boleh kosong!'),
  check('nama').matches(/^[a-z ]+$/i).withMessage('Nama hanya boleh mengandung spasi dan alfabet!'),
  check('username').notEmpty().withMessage('Username tidak boleh kosong!'),
  check('username').isAlphanumeric().withMessage('Username hanya boleh mengandung alfabet dan angka!'),
  check('username').isLength({min: 3}).withMessage('Username minimal terdiri dari 3 karakter!'),
  check('password').notEmpty().withMessage('Password tidak boleh kosong!'),
  check('password').isLength({min: 6}).withMessage('Password minimal terdiri dari 6 karakter!'),
  check('passwordConfirm').notEmpty().withMessage('Konfirmasi password tidak boleh kosong!'),
  (req, res, next) => {
    let errors = validationResult(req).array();
    
    const { nama, username, password, passwordConfirm } = req.body;
    if (password != passwordConfirm) {
      errors.push({ msg: 'Konfirmasi password tidak sesuai' });
    }

    if (errors.length > 0) {
      const baseUrl = getBaseUrl(req);
      req.session.oldAdmin = { nama, username };
      req.session.error = errors;
      return res.redirect(`${baseUrl}/admin/user-admin/tambah?old_input=true`);
    }

    next();
  }
];

// validator ubah data admin
const ubahAdmin = [
  check('id').notEmpty().withMessage('ID tidak boleh kosong!'),
  check('nama').notEmpty().withMessage('Nama tidak boleh kosong!'),
  check('nama').matches(/^[a-z ]+$/i).withMessage('Nama hanya boleh mengandung spasi dan alfabet!'),
  check('username').notEmpty().withMessage('Username tidak boleh kosong!'),
  check('username').isAlphanumeric().withMessage('Username hanya boleh mengandung alfabet dan angka!'),
  check('username').isLength({min: 3}).withMessage('Username minimal terdiri dari 3 karakter!'),
  (req, res, next) => {
    let errors = validationResult(req).array();
    
    const { nama, username, password, passwordConfirm } = req.body;
    if (password != passwordConfirm) {
      errors.push({ msg: 'Konfirmasi password tidak sesuai' });
    }

    if (errors.length > 0) {
      const baseUrl = getBaseUrl(req);
      const { id } = req.params;
      req.session.oldAdmin = { nama, username };
      req.session.error = errors;
      return res.redirect(`${baseUrl}/admin/user-admin/ubah/${id}?old_input=true`);
    }

    next();
  }
];

// validator ubah password
const ubahPassword = [
  check('oldPassword').notEmpty().withMessage('Pasword lama tidak boleh kosong!'),
  check('newPassword').notEmpty().withMessage('Password baru tidak boleh kosong!'),
  check('newPassword').isLength({min: 6}).withMessage('Password baru minimal terdiri dari 6 karakter!'),
  check('passwordConfirm').notEmpty().withMessage('Konfirmasi password tidak boleh kosong!'),
  (req, res, next) => {
    let errors = validationResult(req).array();
    
    const { newPassword, passwordConfirm } = req.body;
    if (newPassword != passwordConfirm) {
      errors.push({ msg: 'Konfirmasi password tidak sesuai' });
    }

    const baseUrl = getBaseUrl(req);
    if (errors.length > 0) {
      req.session.error = errors;
      const { id } = req.params;
      return res.redirect(`${baseUrl}/admin/user-admin/ubah-password/${id}`);
    }

    next();
  }
];

module.exports = {
  tambahAdmin,
  ubahAdmin,
  ubahPassword,
};