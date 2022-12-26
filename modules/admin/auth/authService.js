const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const getBaseUrl = require('../../../utils/getBaseUrl');

// login service
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const adminExist = await prisma.admin.findFirst({
      select: {
        id: true,
        password: true,
      },
      where: {
        username: username,
        deleted: null
      }
    });

    if (!adminExist) {
      req.session.error = [{ msg: 'Username tidak ditemukan'}];
      return {
        statusCode: 404,
      };
    }

    const passwordMatch = bcrypt.compareSync(password, adminExist.password);

    if (!passwordMatch) {
      req.session.error = [{ msg: 'Password salah!'}];
      return {
        statusCode: 401,
      };
    }

    return {
      statusCode: 200,
      adminId: adminExist.id,
    };
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    req.session.error = [{ msg: 'Maaf terjadi kesalahan sistem' }];

    return res.redirect(`${baseUrl}/admin/auth/login`);
  }
};

module.exports = {
  login,
};