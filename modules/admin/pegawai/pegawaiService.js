const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
        jabatan: true,
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

    data = data.map(async pegawai => {
      let divisi = '-';
      if (pegawai.idDivisi) {
        divisi = await prisma.divisi.findFirst({
          select: {
            divisi: true,
          },
          where: { id: pegawai.idDivisi }
        });
      }

      return {
        ...pegawai,
        divisi,
      }
    })

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

module.exports = {
  dataPegawai,
};