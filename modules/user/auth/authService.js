const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const getBaseUrl = require('../../../utils/getBaseUrl');

// login service
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const pegawaiExist = await prisma.pegawai.findFirst({
      select: {
        id: true,
        password: true,
      },
      where: {
        username,
        deleted: null
      },
    });
    
    if (!pegawaiExist) {
      req.session.error = [{ msg: 'Username tidak ditemukan' }];
      return {
        statusCode: 404,
      };
    }

    const passwordMatch = bcrypt.compareSync(password, pegawaiExist.password);

    if (!passwordMatch) {
      req.session.error = [{ msg: 'Password salah!' }];
      return {
        statusCode: 401,
      };
    }

    return {
      statusCode: 200,
      idPegawai: pegawaiExist.id,
    };
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    req.session.error = [{msg: 'Maaf terjadi kesalahan sistem'}];

    return res.redirect(`${baseUrl}/admin/auth/login`);
  }
};

module.exports = {
  login,
};