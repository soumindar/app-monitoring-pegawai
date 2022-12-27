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
const dataAdminId = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await prisma.admin.findFirst({
      select: {
        id: true,
        nama: true,
        username: true,
      },
      where: {
        id,
        deleted: null,
      },
    });

    if (!data) {
      req.session.error = [{msg: 'User admin tidak ditemukan'}];
      return {
        statusCode: 404,
      };
    }

    return {
      statusCode: 200,
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

// ambil data admin berdasarkan id sebagai api
const dataAdminIdApi = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await prisma.admin.findFirst({
      select: {
        id: true,
        nama: true,
        username: true,
      },
      where: {
        id,
        deleted: null,
      },
    });

    console.log(data);

    if (!data) {
      return res.status(404).json({
        message: 'User admin tidak ditemukan',
        statusCode: 404,
      });
    }

    return res.status(200).json({
      message: 'Berhasil',
      statusCode: 200,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Terjadi kesalahan sistem',
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
      req.session.oldAdmin = { nama, username };
      req.session.error = [{msg: 'Username sudah digunakan oleh user admin lain!'}];
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

    req.session.alert = [{ msg: 'User admin berhasil ditambahkan' }];

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

// service ubah admin 
const ubahAdmin = async (req, res) => {
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
      req.session.error = [{ msg: 'User admin tidak ditemukan'}];
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
      req.session.oldAdmin = { nama, username };
      req.session.error = [{msg: 'Username sudah digunakan oleh user admin lain'}];
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
const ubahPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

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
      req.session.error = [{msg: 'User admin tidak ditemukan'}];
      return {
        statusCode: 404,
      };
    }
    
    const passwordMatch = bcrypt.compareSync(oldPassword, adminExist.password);
    if (!passwordMatch) {
      req.session.error = [{msg: 'Password lama salah!'}];
      return {
        statusCode: 401,
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
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
      req.session.error = [{ msg: 'User admin tidak ditemukan'}];
      return {
        statusCode: 404,
      };
    }

    await prisma.admin.delete({
      where: { id },
    });

    req.session.alert = [{ msg: 'Berhasil menghapus admin' }];
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
  dataAdminId,
  dataAdminIdApi,
  tambahAdmin,
  ubahAdmin,
  ubahPassword,
  hapusAdmin,
};