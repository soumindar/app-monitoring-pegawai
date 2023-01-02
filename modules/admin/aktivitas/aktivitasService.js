const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getBaseUrl = require('../../../utils/getBaseUrl');
const toDateObj = require('../../../utils/toDateObj');
const toDateHtml = require('../../../utils/toDateHtml');
const ckpKeseluruhanService = require('../ckpKeseluruhan/ckpService');
const ckpDivisiService = require('../ckpDivisi/ckpService');
const ckpPegawaiService = require('../ckpPegawai/ckpService');

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
    let { tahun } = req.query;

    const today = toDateObj(new Date());
    tahun = tahun ?? today.getFullYear();
    req.query.tahun = tahun;
    const awalTahun = toDateObj(new Date(`${tahun}-01-01`));
    const akhirTahun = toDateObj(new Date(`${tahun}-12-31`));

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
        pekerjaan: {
          select: {
            id: true,
            pekerjaan: true,
            target: true,
            satuanTarget: true,
            level: {
              select: {
                level: true,
              }
            }
          }
        },
      },
      where: {
        idPegawai,
        deleted: null,
        tglMulai: {
          gte: awalTahun,
          lte: akhirTahun,
        },
        tglSelesai: {
          gte: awalTahun,
          lte: akhirTahun,
        },
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

    const totalData = data.length;
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

    tglMulai = toDateObj(tglMulai);
    tglSelesai = toDateObj(tglSelesai);

    const pegawaiExist = await prisma.pegawai.findFirst({
      select: {
        id: true,
        idDivisi: true,
      },
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

    req.body.tahun = tglSelesai.getFullYear();
    const updateCkpKeseluruhan = ckpKeseluruhanService.tambahCkp(req, res);
    if (updateCkpKeseluruhan.statusCode > 200) {
      req.session.error = [{ msg: 'Maaf, terjadi kesalahan ketika memperbarui CKP keseluruhan'}];
      return {
        statusCode: 500,
      };
    }

    req.body.idDivisi = pegawaiExist.idDivisi;
    const updateCkpDivisi = ckpDivisiService.tambahCkp(req, res);
    if (updateCkpDivisi.statusCode > 200) {
      req.session.error = [{ msg: 'Maaf, terjadi kesalahan ketika memperbarui CKP divisi'}];
      return {
        statusCode: 500,
      };
    }

    req.params.idPegawai = pegawaiExist.id;
    const updateCkpPegawai = ckpPegawaiService.tambahCkp(req, res);
    if (updateCkpPegawai.statusCode > 200) {
      req.session.error = [{ msg: 'Maaf, terjadi kesalahan ketika memperbarui CKP'}];
      return {
        statusCode: 500,
      };
    }

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

// ubah aktivitas
const ubahAktivitas = async (req, res) => {
 try{
  const { idAktivitas } = req.params;
  let { tglMulai, tglSelesai, realisasi } = req.body;
  tglMulai = toDateObj(tglMulai);
  tglSelesai = toDateObj(tglSelesai);
  if (realisasi) {
    realisasi = Number(realisasi);
  } else {
    realisasi = null;
  }

  const aktivitasExist = await prisma.aktivitasPegawai.findFirst({
    select: {
      id: true,
      idPegawai: true,
      pegawai: {
        select: {
          idDivisi: true,
        }
      }
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
  
  const today = toDateObj(new Date());
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

  req.body.tahun = tglSelesai.getFullYear();
  const updateCkpKeseluruhan = ckpKeseluruhanService.tambahCkp(req, res);
  if (updateCkpKeseluruhan.statusCode > 200) {
    req.session.error = [{ msg: 'Maaf, terjadi kesalahan ketika memperbarui CKP keseluruhan'}];
    return {
      statusCode: 500,
    };
  }

  req.body.idDivisi = aktivitasExist.pegawai.idDivisi;
  const updateCkpDivisi = ckpDivisiService.tambahCkp(req, res);
  if (updateCkpDivisi.statusCode > 200) {
    req.session.error = [{ msg: 'Maaf, terjadi kesalahan ketika memperbarui CKP divisi'}];
    return {
      statusCode: 500,
    };
  }

  req.params.idPegawai = aktivitasExist.idPegawai;
  const updateCkpPegawai = ckpPegawaiService.tambahCkp(req, res);
  if (updateCkpPegawai.statusCode > 200) {
    req.session.error = [{ msg: 'Maaf, terjadi kesalahan ketika memperbarui CKP'}];
    return {
      statusCode: 500,
    };
  }

  req.session.alert = [{ msg: 'Data aktivitas berhasil diubah' }];

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

// hapus aktivitas
const hapusAktivitas = async (req, res) => {
  try {
    const { idAktivitas } = req.params;

    const aktivitasExist = await prisma.aktivitasPegawai.findFirst({
      select: {
        idPegawai: true,
        tglSelesai: true,
        pegawai: {
          select: {
            divisi: {
              select: {
                id: true,
              }
            }
          }
        }
      },
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

    req.body.tahun = aktivitasExist.tglSelesai.getFullYear();
    const updateCkpKeseluruhan = ckpKeseluruhanService.tambahCkp(req, res);
    if (updateCkpKeseluruhan.statusCode > 200) {
      req.session.error = [{ msg: 'Maaf, terjadi kesalahan ketika memperbarui CKP keseluruhan'}];
      return {
        statusCode: 500,
      };
    }

    req.body.idDivisi = aktivitasExist.pegawai.divisi.id;
    const updateCkpDivisi = ckpDivisiService.tambahCkp(req, res);
    if (updateCkpDivisi.statusCode > 200) {
      req.session.error = [{ msg: 'Maaf, terjadi kesalahan ketika memperbarui CKP divisi'}];
      return {
        statusCode: 500,
      };
    }

    req.params.idPegawai = aktivitasExist.idPegawai;
    const updateCkpPegawai = ckpPegawaiService.tambahCkp(req, res);
    if (updateCkpPegawai.statusCode > 200) {
      req.session.error = [{ msg: 'Maaf, terjadi kesalahan ketika memperbarui CKP'}];
      return {
        statusCode: 500,
      };
    }

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
  ubahAktivitas,
  hapusAktivitas,
};