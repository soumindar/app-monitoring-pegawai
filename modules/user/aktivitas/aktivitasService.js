const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const momentTz = require('moment-timezone');
const userTimezone = require('../../../config/timezone.config');
const getBaseUrl = require('../../../utils/getBaseUrl');
const toDateHtml = require('../../../utils/toDateHtml');
const toDateObj = require('../../../utils/toDateObj');

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
      where: {
        id: idPegawai,
        deleted: null,
      }
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
        pekerjaan: true,
      },
      where: {
        idPegawai,
        deleted: null,
      },
      skip: offset,
      take: limit,
      orderBy: [
        { tglSelesai: 'asc' },
        { tglMulai: 'asc' },
      ],
    });
    data.forEach(aktivitas => {
      aktivitas.tglMulai = toDateHtml(aktivitas.tglMulai);
      aktivitas.tglSelesai = toDateHtml(aktivitas.tglSelesai);
    });

    const countAktivitas = await prisma.aktivitasPegawai.aggregate({
      _count: { id: true },
      where: {
        idPegawai,
        deleted: null,
      },
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
    return res.render('user/error', {
      baseUrl,
      req,
      statusCode: 500,
    });
  }
};

// ambil data aktivitas berdasarkan id aktivitas
const dataIdAktivitas = async (req, res) => {
  try {
    const { idAktivitas } = req.params;
    let data = await prisma.aktivitasPegawai.findFirst({
      select: {
        id: true,
        idPegawai: true,
        idPekerjaan: true,
        tglMulai: true,
        tglSelesai: true,
        realisasi: true,
        pekerjaan: true,
      },
      where: {
        id: idAktivitas,
        deleted: null,
      },
    });
    
    if (!data) {
      req.session.error = [{msg: 'ID aktivitas tidak ditemukan'}];
      return {
        statusCode: 404,
      };
    }

    data.tglMulai = toDateHtml(data.tglMulai);
    data.tglSelesai = toDateHtml(data.tglSelesai);

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
};

// tambah aktivitas
const tambahAktivitas = async (req, res) => {
  try {
    const { idPegawai } = req.params;
    const { idPekerjaan } = req.body;
    let { tglMulai, tglSelesai } = req.body;
    tglMulai = toDateObj(tglMulai);
    tglSelesai = toDateObj(tglSelesai);

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

    const today = new Date(new Date().setHours(0, 0, 0, 0));
    if (tglMulai < today) {
      req.session.error = [{ msg: 'Tanggal mulai tidak boleh berupa tanggal yang sudah terlewati!'}];
      return {
        statusCode: 400,
      }
    }

    await prisma.aktivitasPegawai.create({
      data: {
        idPegawai,
        idPekerjaan,
        tglMulai,
        tglSelesai,
      }
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

// tambah realisasi
const tambahRealisasi = async (req, res) => {
  try {
    const { idAktivitas } = req.params;
    let { realisasi } = req.body;
    realisasi = Number(realisasi);

    const aktivitasExist = await prisma.aktivitasPegawai.findFirst({
      select: {
        id: true,
        idPegawai: true,
        tglSelesai: true,
      },
      where: {
        id: idAktivitas,
        deleted: null,
      },
    });
    if (!aktivitasExist) {
      req.session.error = [{msg: 'ID aktivitas tidak ditemukan'}];
      return {
        statusCode: 404,
      }
    }

    const today = new Date(new Date().setHours(0, 0, 0, 0));
    if (aktivitasExist.tglSelesai > today) {
      req.session.error = [{msg: 'Aktivitas belum selesai!'}];
      return {
        statusCode: 400,
        idPegawai: aktivitasExist.idPegawai,
      }
    }

    await prisma.aktivitasPegawai.update({
      data: { realisasi },
      where: { id: idAktivitas },
    });

    return {
      statusCode: 200,
      idPegawai: aktivitasExist.idPegawai,
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

module.exports = {
  dataIdPegawai,
  dataIdAktivitas,
  tambahAktivitas,
  tambahRealisasi,
};