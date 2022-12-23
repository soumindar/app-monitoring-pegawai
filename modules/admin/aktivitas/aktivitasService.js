const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const momentTz = require('moment-timezone');
const userTimezone = require('../../../config/timezone.config');
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
    
    data.forEach(aktivitas => {
      aktivitas.tglMulai = aktivitas.tglMulai.getFullYear() + "-" + ("0"+(aktivitas.tglMulai.getMonth()+1)).slice(-2) + "-" + ("0" + aktivitas.tglMulai.getDate()).slice(-2);
      aktivitas.tglSelesai = aktivitas.tglSelesai.getFullYear() + "-" + ("0"+(aktivitas.tglSelesai.getMonth()+1)).slice(-2) + "-" + ("0" + aktivitas.tglSelesai.getDate()).slice(-2);
    });

    const countAktivitas = await prisma.aktivitasPegawai.aggregate({
      _count: { idPegawai: true },
      where: { deleted: null },
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
      aktivitas.tglMulai = aktivitas.tglMulai.getFullYear() + "-" + ("0"+(aktivitas.tglMulai.getMonth()+1)).slice(-2) + "-" + ("0" + aktivitas.tglMulai.getDate()).slice(-2);
      aktivitas.tglSelesai = aktivitas.tglSelesai.getFullYear() + "-" + ("0"+(aktivitas.tglSelesai.getMonth()+1)).slice(-2) + "-" + ("0" + aktivitas.tglSelesai.getDate()).slice(-2);
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
    return res.render('admin/error', {
      baseUrl,
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

    data.tglMulai = data.tglMulai.getFullYear() + "-" + ("0"+(data.tglMulai.getMonth()+1)).slice(-2) + "-" + ("0" + data.tglMulai.getDate()).slice(-2);
    data.tglSelesai = data.tglSelesai.getFullYear() + "-" + ("0"+(data.tglSelesai.getMonth()+1)).slice(-2) + "-" + ("0" + data.tglSelesai.getDate()).slice(-2);

    return {
      statusCode: 200,
      data,
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
    const { idPekerjaan } = req.body;
    let { tglMulai, tglSelesai } = req.body;

    const tglMulaiWib = momentTz(tglMulai).tz(userTimezone).format();
    const tglSelesaiWib = momentTz(tglSelesai).tz(userTimezone).format();
    tglMulai = new Date(tglMulaiWib.substring(0, 10));
    tglSelesai = new Date(tglSelesaiWib.substring(0, 10));

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
    return res.render('admin/error', {
      baseUrl,
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
    console.log(error.message);
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
};

// ubah aktivitas
const ubahAktivitas = async (req, res) => {
 try{
  const { idAktivitas } = req.params;
  let { tglMulai, tglSelesai, realisasi } = req.body;

  const tglMulaiWib = momentTz(tglMulai).tz(userTimezone).format();
  const tglSelesaiWib = momentTz(tglSelesai).tz(userTimezone).format();
  tglMulai = new Date(tglMulaiWib.substring(0, 10));
  tglSelesai = new Date(tglSelesaiWib.substring(0, 10));

  realisasi = Number(realisasi);

  const aktivitasExist = await prisma.aktivitasPegawai.findFirst({
    select: {
      id: true,
      idPegawai: true,
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
    };
  }

  const today = new Date(new Date().setHours(0, 0, 0, 0));
  if (tglSelesai > today) {
    realisasi = null;
  }

  await prisma.aktivitasPegawai.update({
    data: {
      tglMulai,
      tglSelesai,
      realisasi,
    },
    where: { id: idAktivitas },
  });

  return {
    statusCode: 200,
    idPegawai: aktivitasExist.idPegawai,
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

// hapus aktivitas
const hapusAktivitas = async (req, res) => {
  try {
    const { idAktivitas } = req.params;

    const aktivitasExist = await prisma.aktivitasPegawai.findFirst({
      select: { idPegawai: true },
      where: {
        id: idAktivitas,
        deleted: null,
      }
    });
    if (!aktivitasExist) {
      req.session.error = [{msg: 'ID aktivitas tidak ditemukan'}];
      return {
        statusCode: 404,
      };
    }

    await prisma.aktivitasPegawai.delete({
      where: { id: idAktivitas },
    });

    req.session.alert = [{msg: 'Berhasil menghapus aktivitas'}];
    
    return {
      statusCode: 200,
      idPegawai: aktivitasExist.idPegawai,
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
  dataIdAktivitas,
  tambahAktivitas,
  tambahRealisasi,
  ubahAktivitas,
  hapusAktivitas,
};