const path = require('path');

module.exports = (str) => {
  const basename = path.basename(str);
  const firstDot = basename.indexOf(".");
  const lastDot = basename.lastIndexOf(".");
  const extname = path.extname(basename).replace(/(\.[a-z0-9]+).*/i, "$1");

  if (firstDot === lastDot) {
    return extname;
  }

  return extname;
}