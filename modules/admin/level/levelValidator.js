const { check, validationResult } = require('express-validator');
const getBaseUrl = require('../../../utils/getBaseUrl');

// validator ubah level
const ubahLevel = [
  check('pengali').notEmpty().withMessage('Faktor pengali tidak boleh kosong!'),
  (req, res, next) => {
    let errors = validationResult(req).array();
    
    if (errors.length > 0) {
      const baseUrl = getBaseUrl(req);
      const { id } = req.params;
      const { pengali } = req.body;
      req.session.oldLevel = { pengali };
      req.session.error = errors;
      return res.redirect(`${baseUrl}/admin/level/ubah/${id}?old_input=true`);
    }

    next();
  }
];

module.exports = {
  ubahLevel,
}