const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getBaseUrl = require('../../../utils/getBaseUrl');

const sessionVerify = async (req, res, next) => {
  try {
    const baseUrl = getBaseUrl(req);
    if (!req.session.adminId) {
      req.session.error = 'Harap login terlebih dahulu!';
      return res.redirect(`${baseUrl}/auth/admin/login`);
    }

    const adminIdMatch = await prisma.admin.findFirst({
      select: {
        id: true,
      },
      where: {
        id: req.session.adminId,
        deleted: null,
      },
    });

    if (!adminIdMatch) {
      req.session.error = 'Harap login terlebih dahulu!';
      return res.redirect(`${baseUrl}/auth/admin/login`);
    }

    // res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      statusCode: 500,
    });
  }
};

module.exports = sessionVerify;