const { check, validationResult } = require('express-validator');
const getBaseUrl = require('../../../utils/getBaseUrl');

// validator ubah data pegawai
const ubahPegawai = [
  check('nip').notEmpty().withMessage('NIP tidak boleh kosong!'),
  check('nip').matches(/^[0-9]{6}$/).withMessage('NIP harus berupa 6 digit angka!'),
  check('nama').notEmpty().withMessage('Nama tidak boleh kosong!'),
  check('nama').matches(/^[a-z ]+$/i).withMessage('Nama hanya boleh mengandung spasi dan alfabet!'),
  check('tglLahir').notEmpty().withMessage('Tanggal lahir tidak boleh kosong!'),
  check('idJabatan').not().equals('Pilih Jabatan...').withMessage('Jabatan tidak boleh kosong'),
  check('idDivisi').not().equals('Pilih Divisi...').withMessage('Divisi tidak boleh kosong!'),
  check('username').isAlphanumeric().withMessage('Username hanya boleh mengandung alfabet dan angka!'),
  check('username').isLength({min: 3}).withMessage('Username minimal terdiri dari 3 karakter!'),
  (req, res, next) => {
    let errors = validationResult(req).array();
    if (errors.length > 0) {
      const { nip, nama, tglLahir, idJabatan, idDivisi, username } = req.body;
      const { id } = req.params;
      const baseUrl = getBaseUrl(req);
      req.session.oldPegawai = { nip, nama, tglLahir, idJabatan, idDivisi, username };
      req.session.error = errors;
      return res.redirect(`${baseUrl}/user/pegawai/ubah/${id}?old_input=true`);
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

    if (errors.length > 0) {
      req.session.error = errors;
      const baseUrl = getBaseUrl(req);
      const { id } = req.params;
      return res.redirect(`${baseUrl}/admin/pegawai/ubah-password/${id}`);
    }

    next();
  }
];

module.exports = {
  ubahPegawai,
  ubahPassword,
};