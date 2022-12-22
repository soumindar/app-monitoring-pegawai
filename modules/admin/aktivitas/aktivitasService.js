const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getBaseUrl = require('../../../utils/getBaseUrl');

// ambil data aktivitas
const dataAktivitas = async (req, res) => {
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

module.exports = {
  dataAktivitas,
};