const { check, validationResult } = require('express-validator');
const getBaseUrl = require('../../../utils/getBaseUrl');

// validator tambah pekerjaan
const tambahPekerjaan = [
  check('idDivisi').not().equals('Pilih Divisi...').withMessage('Divisi tidak boleh kosong!'),
  check('pekerjaan').notEmpty().withMessage('Pekerjaan tidak boleh kosong!'),
  check('durasi').notEmpty().withMessage('Durasi tidak boleh kosong!'),
  check('durasi').isInt({min: 1}).withMessage('Durasi harus berupa bilangan bulat lebih dari 0'),
  check('target').notEmpty().withMessage('Target tidak boleh kosong!'),
  check('satuanTarget').notEmpty().withMessage('Satuan target tidak boleh kosong!'),
  check('idLevel').not().equals('Pilih Level...').withMessage('Level tidak boleh kosong!'),
  (req, res, next) => {
    let errors = validationResult(req).array();
    
    if (errors.length > 0) {
      const { idDivisi, pekerjaan, durasi, target, satuanTarget, idLevel } = req.body;
      const baseUrl = getBaseUrl(req);
      req.session.oldPekerjaan = { idDivisi, pekerjaan, durasi, target, satuanTarget, idLevel };
      req.session.error = errors;
      return res.redirect(`${baseUrl}/admin/pekerjaan/tambah?old_input=true`);
    }

    next();
  }
];

// validator ubah pekerjaan
const ubahPekerjaan = [
  check('idDivisi').not().equals('Pilih Divisi...').withMessage('Divisi tidak boleh kosong!'),
  check('pekerjaan').notEmpty().withMessage('Pekerjaan tidak boleh kosong!'),
  check('durasi').notEmpty().withMessage('Durasi tidak boleh kosong!'),
  check('durasi').isInt({min: 1}).withMessage('Durasi harus berupa bilangan bulat lebih dari 0'),
  check('target').notEmpty().withMessage('Target tidak boleh kosong!'),
  check('satuanTarget').notEmpty().withMessage('Satuan target tidak boleh kosong!'),
  check('idLevel').not().equals('Pilih Level...').withMessage('Level tidak boleh kosong!'),
  (req, res, next) => {
    let errors = validationResult(req).array();
    
    if (errors.length > 0) {
      const { idDivisi, pekerjaan, durasi, target, satuanTarget, idLevel } = req.body;
      const { id } = req.params;
      const baseUrl = getBaseUrl(req);
      req.session.oldPekerjaan = { idDivisi, pekerjaan, durasi, target, satuanTarget, idLevel };
      req.session.error = errors;
      return res.redirect(`${baseUrl}/admin/pekerjaan/ubah/${id}?old_input=true`);
    }

    next();
  }
];

module.exports = {
  tambahPekerjaan,
  ubahPekerjaan,
};