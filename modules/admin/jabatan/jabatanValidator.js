const { check, validationResult } = require('express-validator');
const getBaseUrl = require('../../../utils/getBaseUrl');

// validator tambah jabatan
const tambahJabatan = [
  check('jabatan').notEmpty().withMessage('Jabatan tidak boleh kosong!'),
  check('keterangan').notEmpty().withMessage('Keterangan tidak boleh kosong!'),
  (req, res, next) => {
    let errors = validationResult(req).array();
    
    if (errors.length > 0) {
      const baseUrl = getBaseUrl(req);
      const { jabatan, keterangan } = req.body;
      req.session.oldJabatan = { jabatan, keterangan };
      req.session.error = errors;
      return res.redirect(`${baseUrl}/admin/jabatan/tambah?old_input=true`);
    }

    next();
  }
];

module.exports = {
  tambahJabatan,
};