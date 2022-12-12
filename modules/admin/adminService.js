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
      statusCode: 200,
      data,
      currentPage,
      totalData,
      totalPage,
    };
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
};

// get admin by id
const dataIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await prisma.admin.findFirst({
      select: {
        id: true,
        nama: true,
        username: true,
      },
      where: { id },
    });

    return {
      data,
    }
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
}

// create admin service
const tambahAdmin = async (req, res) => {
  try {
    const { nama, username, password } = req.body;

    const usernameExist = await prisma.admin.findFirst({
      select: { username: true },
      where: { username },
    });
    if (usernameExist) {
      req.session.old = { nama, username };
      req.session.error = [{msg: 'Username sudah digunakan oleh user lain'}];
      return {
        statusCode: 409,
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await prisma.admin.create({
      data: {
        nama,
        username,
        password: hashedPassword,
      }
    });

    req.session.alert = [
      { msg: 'Admin berhasil ditambahkan'}
    ];

    return {
      statusCode: 200,
    };
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
};

// edit admin service
const edit = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, username } = req.body;

    const idExist = await prisma.admin.findFirst({
      select: { id: true },
      where: { 
        id,
        deleted: null,
      },
    });
    if (!idExist) {
      req.session.error = [{ msg: 'ID tidak ditemukan'}];
      return {
        statusCode: 404,
      };
    }

    const usernameExist = await prisma.admin.findFirst({
      select: { username: true },
      where: { username },
    });
    if (usernameExist) {
      req.session.old = { nama, username };
      req.session.error = [{msg: 'Username sudah digunakan oleh user lain'}];
      return {
        statusCode: 409,
      };
    }

    await prisma.admin.update({
      data: {
        nama,
        username,
      },
      where: { id },
    });
    req.session.alert = [{ msg: 'Data berhasil diubah'}];

    return {
      statusCode: 200,
    };
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
};

// delete admin service
const hapusAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const idExist = await prisma.admin.findFirst({
      select: { id: true },
      where: { 
        id,
        deleted: null,
      },
    });
    if (!idExist) {
      req.session.error = [{ msg: 'ID tidak ditemukan'}];
      return {
        statusCode: 404,
      };
    }

    await prisma.admin.delete({
      where: { id },
    });

    req.session.alert = [{ msg: 'Berhasil menghapus' }];
    return {
      statusCode: 200,
    };
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
}

module.exports = {
  dataAdmin,
  dataIdAdmin,
  tambahAdmin,
  hapusAdmin
};