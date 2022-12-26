const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getBaseUrl = require('../../../utils/getBaseUrl');
const bcrypt = require('bcrypt');
const toDateObj = require('../../../utils/toDateObj');
const toDateHtml = require('../../../utils/toDateHtml');
const getExtention = require('../../../utils/getExtention');
const fs = require('fs');
const sharp = require('sharp');

// ambil data pegawai berdasarkan id di params
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
      req.session.error = [{ msg: 'ID pegawai tidak ditemukan' }];
      return {
        statusCode: 404,
      };
    }

    let data = await prisma.pegawai.findFirst({
      select: {
        id: true,
        nip: true,
        idJabatan: true,
        idDivisi: true,
        nama: true,
        tglLahir: true,
        username: true,
        jabatan: true,
        divisi: true,
      },
      where: { id },
    });
    data.tglLahir = toDateHtml(data.tglLahir);
    
    return {
      statusCode: 200,
      data,
    };
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('user/error', {
      baseUrl,
      req,
      statusCode: 500,
    });
  }
}

// ubah data pegawai
const ubahPegawai = async (req, res) => {
  try {
    const { id } = req.params;
    const { nip, nama, idJabatan, idDivisi, username } = req.body;
    let { tglLahir } = req.body;
    
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
      req.session.oldPegawai = { nip, nama, tglLahir, idJabatan, idDivisi, username };
      req.session.error = [{msg: 'Username sudah digunakan oleh pegawai lain'}];
      return {
        statusCode: 409,
      };
    }

    tglLahir = toDateObj(tglLahir);

    await prisma.pegawai.update({
      data: {
        nip,
        nama,
        tglLahir,
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
    return res.render('user/error', {
      baseUrl,
      req,
      statusCode: 500,
    });
  }
};

// ubah foto
const ubahFoto = async (req, res) => {
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
    
    const fileFoto = req.files.foto;
    const allowExt = ['.jpg', '.jpeg', '.png'];
    const extFoto = getExtention(fileFoto.name);
    if (!allowExt.includes(extFoto)) {
      req.session.error = [{ msg: 'Format foto tidak sesuai!' }];
      return {
        statusCode: 422,
      };
    }

    let uploadPath = `${__basedir}/public/img/user/${id}`;
    const fotoExist = await prisma.pegawai.findFirst({
      select: { foto: true },
      where: { id },
    });
    if (fotoExist.foto && fs.existsSync(`${uploadPath}/${fotoExist.foto}`)) {
      fs.unlinkSync(`${uploadPath}/${fotoExist.foto}`);
    }
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }

    const compressConfig = {
      lossless: true,
      quality: 60,
      alphaQuality: 80,
    }
    const compressedImg = sharp(fileFoto.data).toFormat('jpeg').jpeg(compressConfig).resize(1000, 1000);

    const fileName =  Date.now() + extFoto;
    uploadPath += `/${fileName}`;
    await compressedImg.toFile(uploadPath);

    await prisma.pegawai.update({
      data: { foto: fileName },
      where: { id },
    });
    
    return {
      statusCode: 200,
    };
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('user/error', {
      baseUrl,
      req,
      statusCode: 500,
    });
  }
}

// ubah password
const ubahPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

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
      req,
      statusCode: 500,
    });
  }
};

module.exports = {
  dataPegawaiId,
  ubahPegawai,
  ubahFoto,
  ubahPassword,
};