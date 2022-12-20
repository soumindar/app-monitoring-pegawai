const { check, validationResult } = require('express-validator');
const getBaseUrl = require('../../../utils/getBaseUrl');

// validator tambah pegawai
const tambahPegawai = [
  check('nip').notEmpty().withMessage('NIP tidak boleh kosong!'),
  check('nip').matches(/^[0-9]{6}$/).withMessage('NIP harus berupa 6 digit angka!'),
  check('nama').notEmpty().withMessage('Nama tidak boleh kosong!'),
  check('nama').matches(/^[a-z ]+$/i).withMessage('Nama hanya boleh mengandung spasi dan alfabet!'),
  check('tglLahir').notEmpty().withMessage('Tanggal lahir tidak boleh kosong!'),
  check('idJabatan').not().equals('Pilih Jabatan...').withMessage('Jabatan tidak boleh kosong'),
  check('idDivisi').not().equals('Pilih Divisi...').withMessage('Divisi tidak boleh kosong!'),
  check('username').isAlphanumeric().withMessage('Username hanya boleh mengandung alfabet dan angka!'),
  check('username').isLength({min: 3}).withMessage('Username minimal terdiri dari 3 karakter!'),
  check('password').notEmpty().withMessage('Password tidak boleh kosong!'),
  check('password').isLength({min: 6}).withMessage('Password minimal terdiri dari 6 karakter!'),
  check('passwordConfirm').notEmpty().withMessage('Konfirmasi password tidak boleh kosong!'),
  (req, res, next) => {
    let errors = validationResult(req).array();
    
    const { nip, nama, tglLahir, idJabatan, idDivisi, username, password, passwordConfirm } = req.body;
    if (password != passwordConfirm) {
      errors.push({ msg: 'Konfirmasi password tidak sesuai' });
    }

    const baseUrl = getBaseUrl(req);
    if (errors.length > 0) {
      req.session.oldPegawai = { nip, nama, tglLahir, idJabatan, idDivisi, username };
      req.session.error = errors;
      return res.redirect(`${baseUrl}/admin/pegawai/tambah?old_input=true`);
    }

    next();
  }
];

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
      return res.redirect(`${baseUrl}/admin/pegawai/ubah/${id}?old_input=true`);
    }

    next();
  }
];

module.exports = {
  tambahPegawai,
  ubahPegawai,
};