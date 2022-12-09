const { check, validationResult } = require('express-validator');
const getBaseUrl = require('../../utils/getBaseUrl');

const tambahAdmin = [
  check('nama').notEmpty().withMessage('Nama tidak boleh kosong!'),
  check('nama').isAlpha().withMessage('Nama hanya boleh mengandung spasi dan alfabet!'),
  check('username').isAlphanumeric().withMessage('Username hanya boleh mengandung alfabet dan angka!'),
  check('username').isLength({min: 3}).withMessage('Username minimal terdiri dari 3 karakter!'),
  check('password').notEmpty().withMessage('Password tidak boleh kosong!'),
  check('password').isLength({min: 6}).withMessage('Password minimal terdiri dari 6 karakter!'),
  check('password_confirm').notEmpty().withMessage('Konfirmasi password tidak boleh kosong!'),
  (req, res, next) => {
    let errors = [];
    errors = validationResult(req);
    errors = errors.array();
    
    const { nama, username, password, password_confirm } = req.body;
    if (password != password_confirm) {
      errors.push({ msg: 'Konfirmasi password tidak sesuai' });
    }

    const baseUrl = getBaseUrl(req);
    if (errors.length > 0) {
      req.session.old = { nama, username };
      return res.render('admin/tambahAdmin', {
        baseUrl,
        req,
        errors,
      });
    }

    next();
  }
];

const id = [
  check('id').notEmpty().withMessage('ID untuk dihapus tidak ditemukan'),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render()
    }
  }
]

module.exports = {
  tambahAdmin,
};