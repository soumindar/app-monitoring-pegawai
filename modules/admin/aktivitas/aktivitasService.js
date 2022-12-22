const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getBaseUrl = require('../../../utils/getBaseUrl');

// ambil selururuh data aktivitas dengan pagination
const dataLengkap = async (req, res) => {
  try {
    const { page } = req.query;
    const currentPage = (Number(page) > 0) ? Number(page) : 1;
    const limit = 10;
    const offset = (currentPage - 1) * limit;
    
    let data = await prisma.aktivitasPegawai.findMany({
      select: {
        idPegawai: true,
        idPekerjaan: true,
        tglMulai: true,
        tglSelesai: true,
        realisasi: true,
      },
      where: {
        deleted: null,
      },
      skip: offset,
      take: limit,
      orderBy: {
        tglMulai: 'asc',
      }
    });
    
    const countAktivitas = await prisma.aktivitasPegawai.aggregate({
      _count: { idPegawai: true },
    });
    const totalData = Number(countAktivitas._count.id);
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

// ambil data aktivitas berdasarkan id pegawai
const dataIdPegawai = async (req, res) => {
  try {
    const { idPegawai } = req.params;
    const { page } = req.query;
    const currentPage = (Number(page) > 0) ? Number(page) : 1;
    const limit = 10;
    const offset = (currentPage - 1) * limit;

    const pegawaiExist = await prisma.pegawai.findFirst({
      select: { id: true },
      where: { id: idPegawai }
    });
    if (!pegawaiExist) {
      req.session.error = [{msg: 'Pegawai tidak ditemukan'}];
      return {
        statusCode: 404
      };
    }

    let data = await prisma.aktivitasPegawai.findMany({
      select: {
        id: true,
        idPegawai: true,
        idPekerjaan: true,
        tglMulai: true,
        tglSelesai: true,
        realisasi: true,
      },
      where: {
        idPegawai
      },
      skip: offset,
      take: limit,
      orderBy: {
        tglMulai: 'asc',
      },
    });
    data.forEach(data => {
      data.tglMulai = data.tglMulai.getFullYear() + "-" + ("0"+(data.tglMulai.getMonth()+1)).slice(-2) + "-" + ("0" + data.tglMulai.getDate()).slice(-2);
      data.tglSelesai = data.tglSelesai.getFullYear() + "-" + ("0"+(data.tglSelesai.getMonth()+1)).slice(-2) + "-" + ("0" + data.tglSelesai.getDate()).slice(-2);
    });

    const countAktivitas = await prisma.aktivitasPegawai.aggregate({
      _count: { id: true },
      where: { idPegawai },
    });
    const totalData = Number(countAktivitas._count.id);
    const totalPage = Math.ceil(totalData / limit);

    return {
      statusCode: 200,
      data,
      currentPage,
      totalData,
      totalPage,
    };
  } catch (error) {
    console.log(error.message);
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
};

// tambah aktivitas
const tambahAktivitas = async (req, res) => {
  try {
    const { idPegawai } = req.params;
    const { idPekerjaan, tglMulai, tglSelesai } = req.body;
    
    const pegawaiExist = await prisma.pegawai.findFirst({
      select: { id: true },
      where: { 
        id: idPegawai,
        deleted: null,
      },
    });
    if (!pegawaiExist) {
      req.session.error = [{msg: 'ID pegawai tidak ditemukan!'}];
      return {
        statusCode: 404,
      };
    }

    const pekerjaanExist = await prisma.pekerjaan.findFirst({
      select: { id: true },
      where: {
        id: idPekerjaan,
        deleted: null,
      },
    });
    if (!pekerjaanExist) {
      req.session.error = [{msg: 'ID pekerjaan tidak ditemukan'}];
      return {
        statusCode: 404,
      };
    }

    const objTglMulai = new Date(tglMulai);
    const objTglSelesai = new Date(tglSelesai);
    await prisma.aktivitasPegawai.create({
      data: {
        idPegawai,
        idPekerjaan,
        tglMulai: objTglMulai,
        tglSelesai: objTglSelesai,
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

module.exports = {
  dataLengkap,
  dataIdPegawai,
  tambahAktivitas,
};