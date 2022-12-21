const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getBaseUrl = require('../../../utils/getBaseUrl');

// ambil semua data jabatan
const dataLengkap = async (req, res) => {
  try {
    const getData = await prisma.jabatan.findMany({
      select: {
        id: true,
        jabatan: true,
      },
      where: {
        deleted: null
      },
    });

    return {
      statusCode: 200,
      data: getData,
    }
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
};

// ambil data jabatan dengan pagination
const dataPagination = async (req, res) => {
  try {
    const { page } = req.query;
    const currentPage = (Number(page) > 0) ? Number(page) : 1;
    const limit = 10;
    const offset = (currentPage - 1) * limit;
    
    let data = await prisma.jabatan.findMany({
      select: {
        id: true,
        jabatan: true,
        keterangan: true,
      },
      where: {
        deleted: null,
      },
      skip: offset,
      take: limit,
      orderBy: {
        jabatan: 'asc',
      }
    });

    const countJabatan = await prisma.jabatan.aggregate({
      _count: { id: true },
    });
    const totalData = Number(countJabatan._count.id);
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

// tambah jabatan
const tambahJabatan = async (req, res) => {
  try {
    const { jabatan, keterangan } = req.body;
    
    const jabatanExist = await prisma.jabatan.findFirst({
      select: { jabatan: true },
      where: { 
        jabatan,
        deleted: null,
      },
    });
    if (jabatanExist) {
      req.session.oldJabatan = { jabatan, keterangan };
      req.session.error = [{msg: 'Jabatan sudah ada'}];
      return {
        statusCode: 409,
      };
    }

    await prisma.jabatan.create({
      data: {
        jabatan,
        keterangan,
      },
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
  dataPagination,
  tambahJabatan,
};