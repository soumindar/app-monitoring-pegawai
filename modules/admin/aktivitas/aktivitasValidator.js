const { check, validationResult } = require('express-validator');
const getBaseUrl = require('../../../utils/getBaseUrl');

// validator tambah aktivitas
const tambahAktivitas = [
  check('idPegawai').notEmpty().withMessage('ID pegawai tidak boleh kosong!'),
  check('idPekerjaan').notEmpty().withMessage('Pekerjaan tidak boleh kosong!'),
  check('tglMulai').notEmpty().withMessage('Tanggal mulai tidak boleh kosong!'),
  check('tglSelesai').notEmpty().withMessage('Tanggal selesai tidak boleh kosong!'),
  (req, res, next) => {
    let errors = validationResult(req).array();
    console.log(req.body)
    if (errors.length > 0) {
      const { idPegawai } = req.params;
      const baseUrl = getBaseUrl(req);
      req.session.error = errors;
      return res.redirect(`${baseUrl}/admin/aktivitas/pegawai/tambah/${idPegawai}`);
    }

    next();
  }
];

module.exports = {
  tambahAktivitas,
};