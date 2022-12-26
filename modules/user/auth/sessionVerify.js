const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getBaseUrl = require('../../../utils/getBaseUrl');

const sessionVerify = async (req, res, next) => {
  try {
    const baseUrl = getBaseUrl(req);
    if (!req.session.userId) {
      req.session.error = [{ msg: 'Harap login terlebih dahulu!' }];
      return res.redirect(`${baseUrl}/user/auth/login`);
    }

    const userIdMatch = await prisma.pegawai.findFirst({
      select: {
        id: true,
      },
      where: {
        id: req.session.userId,
        deleted: null,
      },
    });

    if (!userIdMatch) {
      req.session.error = [{ msg: 'User tidak ditemukan' }];
      return res.redirect(`${baseUrl}/user/auth/login`);
    }

    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

    next();
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    req.session.error = [{msg: 'Maaf terjadi kesalahan sistem'}];

    return res.redirect(`${baseUrl}/user/auth/login`);
  }
};

module.exports = sessionVerify;