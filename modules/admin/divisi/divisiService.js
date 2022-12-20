const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getBaseUrl = require('../../../utils/getBaseUrl');

// ambil data divisi
const ambilData = async (req, res) => {
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

module.exports = {
  ambilData,
};