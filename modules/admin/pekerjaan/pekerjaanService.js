const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getBaseUrl = require('../../../utils/getBaseUrl');
const bcrypt = require('bcrypt');
const divisiService = require('../divisi/divisiService');

// ambil data pegawai
const dataPekerjaanDivisi = async (req, res) => {
  try {
    const { page, idDivisi } = req.query;
    const currentPage = (Number(page) > 0) ? Number(page) : 1;
    const limit = 10;
    const offset = (currentPage - 1) * limit;
    
    const dataDivisi = await divisiService.dataDivisiId(req, res);
    if (!dataDivisi) {
      return {
        statusCode: 404,
      }
    }

    const data = await prisma.pekerjaan.findMany({
      select: {
        id: true,
        pekerjaan: true,
        durasi: true,
        target: true,
        satuanTarget: true,
        target: true,
        idLevel: true,
        idDivisi: true,
      },
      where: {
        idDivisi,
        deleted: null,
      },
      skip: offset,
      take: limit,
      orderBy: {
        pekerjaan: 'asc',
      }
    });

    const countPekerjaan = await prisma.pekerjaan.aggregate({
      _count: { id: true },
      where: {
        idDivisi,
        deleted: null,
      },
    });
    const totalData = Number(countPekerjaan._count.id);
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

module.exports ={
  dataPekerjaanDivisi,
};