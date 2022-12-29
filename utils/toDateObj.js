const momentTz = require('moment-timezone');
const userTimezone = require('../config/timezone.config');

module.exports = (date) => {
  const tglLahirWib = momentTz(date, 'YYYY-MM-DD').tz(userTimezone).format();
  return new Date(tglLahirWib.substring(0, 10));
};