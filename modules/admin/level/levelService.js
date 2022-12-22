const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getBaseUrl = require('../../../utils/getBaseUrl');

// ambil data level
const dataLengkap = async (req, res) => {
  try {
    const getData = await prisma.level.findMany({
      select: {
        id: true,
        level: true,
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
};

// ambil data level dengan pagination
const dataPagination = async (req, res) => {
  try {
    const { page } = req.query;
    const currentPage = (Number(page) > 0) ? Number(page) : 1;
    const limit = 10;
    const offset = (currentPage - 1) * limit;
    
    let data = await prisma.level.findMany({
      select: {
        id: true,
        level: true,
        pengali: true,
      },
      where: {
        deleted: null,
      },
      skip: offset,
      take: limit,
      orderBy: {
        pengali: 'asc',
      }
    });

    const countLevel = await prisma.level.aggregate({
      _count: { id: true },
    });
    const totalData = Number(countLevel._count.id);
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

// ambil data level berdasarkan id di params
const dataIdParams = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await prisma.level.findFirst({
      select: {
        id: true,
        level: true,
        pengali: true,
      },
      where: { id },
    });
    if (!data) {
      req.session.error = [{msg: 'Level tidak ditemukan'}];
      return {
        statusCode: 404,
      };
    }
    
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
}

// ubah data level
const ubahLevel = async (req, res) => {
  try {
    const { id } = req.params;
    let { pengali } = req.body;
    pengali = Number(pengali);

    const idExist = await prisma.level.findFirst({
      select: { id: true },
      where: {
        id,
        deleted: null,
      }
    });
    if (!idExist) {
      req.session.error = [{msg: 'Level tidak ditemukan'}];
      return {
        statusCode: 404,
      };
    }

    await prisma.level.update({
      data: {
        pengali,
      },
      where: { id },
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
  dataIdParams,
  ubahLevel,
};