const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getBaseUrl = require('../../../utils/getBaseUrl');

// ambil data divisi
const dataLengkap = async (req, res) => {
  try {
    const getData = await prisma.divisi.findMany({
      select: {
        id: true,
        divisi: true,
      },
      where: {
        deleted: null
      },
    });

    return {
      statusCode: 200,
      data: getData,
    };
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
}

// ambil data divisi dengan pagination
const dataPagination = async (req, res) => {
  try {
    const { page } = req.query;
    const currentPage = (Number(page) > 0) ? Number(page) : 1;
    const limit = 10;
    const offset = (currentPage - 1) * limit;
    
    let data = await prisma.divisi.findMany({
      select: {
        id: true,
        divisi: true,
        keterangan: true,
      },
      where: {
        deleted: null,
      },
      skip: offset,
      take: limit,
      orderBy: {
        divisi: 'asc',
      }
    });

    const countDivisi = await prisma.divisi.aggregate({
      _count: { id: true },
    });
    const totalData = Number(countDivisi._count.id);
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

module.exports = {
  dataLengkap,
  dataPagination,
};