const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

// ambil data admin
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

// ambil data admin berdasarkan id
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

// tambah admin 
const tambahAdmin = async (req, res) => {
  try {
    const { nama, username, password } = req.body;

    const usernameExist = await prisma.admin.findFirst({
      select: { username: true },
      where: { username },
    });
    if (usernameExist) {
      req.session.old = { nama, username };
      req.session.error = [{msg: 'Username sudah digunakan oleh admin lain'}];
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

// service edit admin 
const editAdmin = async (req, res) => {
  try {
    console.log('ok');
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
      select: {
        id: true,
        username: true,
      },
      where: { username },
    });
    if (usernameExist && (usernameExist.id != id)) {
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

// service ubah password 
const ubahPass = async (req, res) => {
  try {
    const { id } = req.params;
    const { old_password, new_password } = req.body;

    const adminExist = await prisma.admin.findFirst({
      select: {
        id: true,
        password: true,
      },
      where: {
        id,
        deleted: null,
      }
    });

    if (!adminExist) {
      req.session.error = [{msg: 'ID tidak ditemukan'}];
      return {
        statusCode: 404,
      };
    }
    
    const passwordMatch = bcrypt.compareSync(old_password, adminExist.password);
    if (!passwordMatch) {
      req.session.error = [{msg: 'Password lama salah!'}];
      return {
        statusCode: 401,
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);
    await prisma.admin.update({
      data: {
        password: hashedPassword,
      },
      where: {
        id
      }
    });

    req.session.alert = [{msg: 'Password berhasil diubah'}];
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

// service hapus admin
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
};

module.exports = {
  dataAdmin,
  dataIdAdmin,
  tambahAdmin,
  editAdmin,
  ubahPass,
  hapusAdmin,
};