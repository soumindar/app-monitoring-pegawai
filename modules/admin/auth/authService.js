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
      return {
        message: 'Username tidak ditemukan',
        statusCode: 404,
      };
    }

    const passwordMatch = bcrypt.compareSync(password, adminExist.password);

    if (!passwordMatch) {
      return {
        message: 'Password salah!',
        statusCode: 401,
      };
    }

    return {
      message: 'Login berhasil',
      statusCode: 200,
      adminId: adminExist.id,
    };
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
};

module.exports = {
  login,
};