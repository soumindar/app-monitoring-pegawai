const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

// get data admin
const dataAdmin = async (req, res) => {
  try {
    const { page } = req.query;
    const currentPage = (Number(page) > 0) ? Number(page) : 1;
    const limit = 10;
    const offset = (currentPage - 1) * limit;
    
    const data = await prisma.admin.findMany({
      select: {
        id: true,
        nama: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        deleted: null,
      },
      skip: offset,
      take: limit,
      orderBy: {
        nama: 'asc'
      }
    });

    const countAdmin = await prisma.admin.aggregate({
      _count: { id: true },
    });
    const totalData = Number(countAdmin._count.id);
    const totalPage = Math.ceil(totalData / limit);

    return {
      message: 'success',
      statusCode: 200,
      data,
      currentPage,
      totalData,
      totalPage,
    };
  } catch (error) {
    return res.render('error', {
      baseUrl,
      statusCode: getData.statusCode,
    });
  }
};

// create admin service
const tambahAdmin = async (req, res) => {
  try {
    const { nama, username, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await prisma.admin.create({
      data: {
        nama,
        username,
        password: hashedPassword,
      }
    });

    return {
      message: 'tambah admin sukses',
      statusCode: 200,
    };
  } catch (error) {
    return {
      message: error.message,
      statusCode: 500,
    }
  }
};



module.exports = {
  tambahAdmin,
  dataAdmin,
};