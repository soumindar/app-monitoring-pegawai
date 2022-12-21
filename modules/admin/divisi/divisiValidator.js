const { check, validationResult } = require('express-validator');
const getBaseUrl = require('../../../utils/getBaseUrl');

// validator tambah divisi
const tambahDivisi = [
  check('divisi').notEmpty().withMessage('Divisi tidak boleh kosong!'),
  check('keterangan').notEmpty().withMessage('Keterangan tidak boleh kosong!'),
  (req, res, next) => {
    let errors = validationResult(req).array();
    
    if (errors.length > 0) {
      const baseUrl = getBaseUrl(req);
      const { divisi, keterangan } = req.body;
      req.session.oldDivisi = { divisi, keterangan };
      req.session.error = errors;
      return res.redirect(`${baseUrl}/admin/divisi/tambah?old_input=true`);
    }

    next();
  }
];

module.exports = {
  tambahDivisi,
};