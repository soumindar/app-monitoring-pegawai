const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getBaseUrl = require('../../../utils/getBaseUrl');
const toDateObj = require('../../../utils/toDateObj');
const toBulan = require('../../../utils/toBulan');

// data ckp tahunan
const daftarCkp = async (req, res) => {
  try {
    const today = toDateObj(new Date());
    let { tahun } = req.query;
    tahun = tahun ?? today.getFullYear();
    const awalTahun = toDateObj(new Date(`${tahun}-01-01`));
    const akhirTahun = toDateObj(new Date(`${tahun}-12-31`));

    const ckpTahunan = await prisma.ckpTahunanKeseluruhan.findFirst({
      select: { ckp: true },
      where: {
        tahun: {
          gte: awalTahun,
          lte: akhirTahun,
        }
      }
    });

    let ckpBulanan = await prisma.ckpBulananKeseluruhan.findMany({
      select: {
        bulan: true,
        ckp: true,
      },
      where: {
        bulan: {
          gte: awalTahun,
          lte: akhirTahun,
        }
      }
    });

    ckpBulanan.forEach(ckp => {
      ckp.bulan = toBulan(ckp.bulan.getMonth() + 1);
    });

    return {
      tahun,
      ckpTahunan,
      ckpBulanan,
    }
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
  daftarCkp,
};