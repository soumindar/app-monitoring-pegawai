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
  check('password_confirm').notEmpty().withMessage('Konfirmasi password tidak boleh kosong!'),
  (req, res, next) => {
    let errors = validationResult(req).array();
    
    const { nama, username, password, password_confirm } = req.body;
    if (password != password_confirm) {
      errors.push({ msg: 'Konfirmasi password tidak sesuai' });
    }

    const baseUrl = getBaseUrl(req);
    if (errors.length > 0) {
      req.session.old = { nama, username };
      req.session.error = errors;
      return res.redirect(`${baseUrl}/admin/user-admin/tambah`);
    }

    next();
  }
];

// validator edit admin
const editAdmin = [
  check('id').notEmpty().withMessage('ID tidak boleh kosong!'),
  check('nama').notEmpty().withMessage('Nama tidak boleh kosong!'),
  check('nama').matches(/^[a-z ]+$/i).withMessage('Nama hanya boleh mengandung spasi dan alfabet!'),
  check('username').notEmpty().withMessage('Username tidak boleh kosong!'),
  check('username').isAlphanumeric().withMessage('Username hanya boleh mengandung alfabet dan angka!'),
  check('username').isLength({min: 3}).withMessage('Username minimal terdiri dari 3 karakter!'),
  (req, res, next) => {
    let errors = validationResult(req).array();
    
    const { nama, username, password, password_confirm } = req.body;
    if (password != password_confirm) {
      errors.push({ msg: 'Konfirmasi password tidak sesuai' });
    }

    const baseUrl = getBaseUrl(req);
    if (errors.length > 0) {
      const { id } = req.params;
      req.session.old = { nama, username };
      req.session.error = errors;
      return res.redirect(`${baseUrl}/admin/user-admin/edit/${id}`);
    }

    next();
  }
];

// validator ubah password
const ubahPass = [
  check('old_password').notEmpty().withMessage('Pasword lama tidak boleh kosong!'),
  check('new_password').notEmpty().withMessage('Password baru tidak boleh kosong!'),
  check('new_password').isLength({min: 6}).withMessage('Password baru minimal terdiri dari 6 karakter!'),
  check('password_confirm').notEmpty().withMessage('Konfirmasi password tidak boleh kosong!'),
  (req, res, next) => {
    let errors = validationResult(req).array();
    
    const { new_password, password_confirm } = req.body;
    if (new_password != password_confirm) {
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
  editAdmin,
  ubahPass,
};