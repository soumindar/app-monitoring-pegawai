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
    
    if (errors.length > 0) {
      const { idPegawai } = req.params;
      const baseUrl = getBaseUrl(req);
      req.session.error = errors;
      return res.redirect(`${baseUrl}/user/aktivitas/tambah/${idPegawai}`);
    }

    next();
  }
];

// validator tambah realisasi
const tambahRealisasi = [
  check('idAktivitas').notEmpty().withMessage('ID aktivitas tidak boleh kosong!'),
  check('realisasi').notEmpty().withMessage('Realisasi tidak boleh kosong!'),
  check('realisasi').isNumeric().withMessage('Realisasi harus berupa bilangan!'),
  (req, res, next) => {
    let errors = validationResult(req).array();
    
    if (errors.length > 0) {
      const { idAktivitas } = req.params;
      const baseUrl = getBaseUrl(req);
      req.session.error = errors;
      return res.redirect(`${baseUrl}/user/aktivitas/realisasi/${idAktivitas}`);
    }

    next();
  }
];

// validator ubah aktivitas
const ubahAktivitas = [
  check('tglMulai').notEmpty().withMessage('Tanggal mulai tidak boleh kosong!'),
  check('tglSelesai').notEmpty().withMessage('Tanggal selesai tidak boleh kosong!'),
  check('realisasi').notEmpty().withMessage('Realisasi tidak boleh kosong!'),
  check('realisasi').isNumeric().withMessage('Realisasi harus berupa bilangan!'),
  (req, res, next) => {
    let errors = validationResult(req).array();
    
    if (errors.length > 0) {
      const { idAktivitas } = req.params;
      const baseUrl = getBaseUrl(req);
      req.session.oldAktivitas = { tglMulai, tglSelesai, realiasi };
      req.session.error = errors;
      return res.redirect(`${baseUrl}/admin/aktivitas/pegawai/realisasi/${idAktivitas}?old_input=true`);
    }

    next();
  }
];

module.exports = {
  tambahAktivitas,
  tambahRealisasi,
  ubahAktivitas,
};