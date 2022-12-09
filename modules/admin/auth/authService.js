const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

// login service
const login = async (req, res) => {
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
};

module.exports = {
  login,
};