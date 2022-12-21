const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getBaseUrl = require('../../../utils/getBaseUrl');
const bcrypt = require('bcrypt');

// ambil data pegawai
const dataPegawai = async (req, res) => {
  try {
    const { page } = req.query;
    const currentPage = (Number(page) > 0) ? Number(page) : 1;
    const limit = 10;
    const offset = (currentPage - 1) * limit;
    
    let data = await prisma.pegawai.findMany({
      select: {
        id: true,
        nip: true,
        nama: true,
        idJabatan: true,
        idDivisi: true,
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

    console.log(data);

    const countPegawai = await prisma.pegawai.aggregate({
      _count: { id: true },
    });
    const totalData = Number(countPegawai._count.id);
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

// ambil data pegawai berdasarkan id
const dataPegawaiId = async (req, res) => {
  try {
    const { id } = req.params;

    const idExist = await prisma.pegawai.findFirst({
      select: { id: true },
      where: {
        id,
        deleted: null,
      }
    });
    if (!idExist) {
      req.session.error = [{msg: 'ID pegawai tidak ditemukan'}];
      return {
        statusCode: 404,
      };
    }

    let data = await prisma.pegawai.findFirst({
      select: {
        id: true,
        nip: true,
        nama: true,
        tglLahir: true,
        idJabatan: true,
        idDivisi: true,
        username: true,
      },
      where: { id },
    });
    data.tglLahir = data.tglLahir.getFullYear() + "-" + ("0"+(data.tglLahir.getMonth()+1)).slice(-2) + "-" + ("0" + data.tglLahir.getDate()).slice(-2);
    
    return {
      data,
    };
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
}

// tambah pegawai
const tambahPegawai = async (req, res) => {
  try {
    const { nip, nama, tglLahir, idJabatan, idDivisi, username, password } = req.body;
    
    const nipExist = await prisma.pegawai.findFirst({
      select: { nip: true },
      where: { 
        nip,
        deleted: null,
      },
    });
    if (nipExist) {
      req.session.oldPegawai = { nip, nama, tglLahir, idJabatan, idDivisi, username };
      req.session.error = [{msg: 'NIP sudah dimiliki oleh pegawai lain'}];
      return {
        statusCode: 409,
      };
    }

    const usernameExist = await prisma.pegawai.findFirst({
      select: { username: true },
      where: { username },
    });
    if (usernameExist) {
      req.session.oldPegawai = { nip, nama, tglLahir, idJabatan, idDivisi, username };
      req.session.error = [{msg: 'Username sudah digunakan oleh pegawai lain'}];
      return {
        statusCode: 409,
      };
    }

    const objTglLahir = new Date(tglLahir);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(objTglLahir);
    await prisma.pegawai.create({
      data: {
        nip,
        nama,
        tglLahir: objTglLahir,
        idJabatan,
        idDivisi,
        username,
        password: hashedPassword,
      }
    });

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

// ubah data pegawai
const ubahPegawai = async (req, res) => {
  try {
    const { id } = req.params;
    const { nip, nama, tglLahir, idJabatan, idDivisi, username } = req.body;

    const nipExist = await prisma.pegawai.findFirst({
      select: { nip: true },
      where: {
        nip,
        id: {not: id},
        deleted: null,
      },
    });
    if (nipExist) {
      req.session.oldPegawai = { nip, nama, tglLahir, idJabatan, idDivisi, username };
      req.session.error = [{msg: 'NIP sudah dimiliki oleh pegawai lain'}];
      return {
        statusCode: 409,
      };
    }

    const usernameExist = await prisma.pegawai.findFirst({
      select: { username: true },
      where: {
        username,
        id: {not: id},
      },
    });
    if (usernameExist) {
      console.log('username exist');
      req.session.oldPegawai = { nip, nama, tglLahir, idJabatan, idDivisi, username };
      req.session.error = [{msg: 'Username sudah digunakan oleh pegawai lain'}];
      return {
        statusCode: 409,
      };
    }

    const objTglLahir = new Date(tglLahir);
    await prisma.pegawai.update({
      data: {
        nip,
        nama,
        tglLahir: objTglLahir,
        idJabatan,
        idDivisi,
      },
      where: { id },
    });

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

// ubah password
const ubahPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword, passwordConfirm } = req.body;

    const idExist = await prisma.pegawai.findFirst({
      select: {
        id: true,
        password: true,
      },
      where: {
        id,
        deleted: null,
      },
    });
    if (!idExist) {
      req.session.error = [{msg: 'ID pegawai tidak ditemukan'}];
      return {
        statusCode: 404,
      }
    }

    const passwordMatch = bcrypt.compareSync(oldPassword, idExist.password);
    if (!passwordMatch) {
      req.session.error = [{msg: 'Password lama salah!'}];
      return {
        statusCode: 401,
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await prisma.pegawai.update({
      data: { password: hashedPassword },
      where: { id }
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
}

// hapus pegawai
const hapusPegawai = async (req, res) => {
  try {
    const { id } = req.params;

    const idExist = await prisma.pegawai.findFirst({
      select: {
        id: true,
        password: true,
      },
      where: {
        id,
        deleted: null,
      },
    });
    if (!idExist) {
      req.session.error = [{msg: 'ID pegawai tidak ditemukan'}];
      return {
        statusCode: 404,
      }
    }
    
    await prisma.pegawai.delete({
      where: { id },
    });

    req.session.alert = [{ msg: 'Berhasil menghapus pegawai' }];
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
  dataPegawai,
  dataPegawaiId,
  tambahPegawai,
  ubahPegawai,
  ubahPassword,
  hapusPegawai,
};