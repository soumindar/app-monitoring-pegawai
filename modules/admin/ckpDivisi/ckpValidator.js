const { check, validationResult } = require('express-validator');
const getBaseUrl = require('../../../utils/getBaseUrl');

// validator tambah ckp
const tambahCkp = [
  check('idDivisi').notEmpty().withMessage('ID divisi tidak boleh kosong!'),
  check('tahun').notEmpty().withMessage('Tahun tidak boleh kosong!'),
  check('tahun').isInt({min: 2000, max: 2100}).withMessage('Tahun harus berupa bilangan bulat antara 2000-2100!'),
  (req, res, next) => {
    let errors = validationResult(req).array();
    
    if (errors.length > 0) {
      const baseUrl = getBaseUrl(req);
      req.session.error = errors;
      return res.redirect(`${baseUrl}/admin/ckp-keseluruhan/tambah`);
    }

    next();
  }
];

module.exports = {
  tambahCkp,
};