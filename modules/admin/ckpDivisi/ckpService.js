const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getBaseUrl = require('../../../utils/getBaseUrl');
const toDateObj = require('../../../utils/toDateObj');
const toBulan = require('../../../utils/toBulan');

// data ckp tahunan
const daftarCkp = async (req, res) => {
  try {
    const today = toDateObj(new Date());
    let { tahun, idDivisi } = req.query;
    tahun = tahun ?? today.getFullYear();
    const awalTahun = toDateObj(new Date(`${tahun}-01-01`));
    const akhirTahun = toDateObj(new Date(`${tahun}-12-31`));

    const getCkpTahunan = await prisma.ckpTahunanDivisi.findFirst({
      select: { ckp: true },
      where: {
        idDivisi,
        tahun: awalTahun,
      }
    });
    let ckpTahunan = null;
    let dataTahunanExist = false;
    if (getCkpTahunan) {
      ckpTahunan = getCkpTahunan.ckp;
      dataTahunanExist = true;
    }
    
    let ckpBulanan = await prisma.ckpBulananDivisi.findMany({
      select: {
        bulan: true,
        ckp: true,
      },
      where: {
        idDivisi,
        bulan: {
          gte: awalTahun,
          lte: akhirTahun,
        }
      }
    });

    ckpBulanan.forEach(ckp => {
      ckp.bulan = toBulan(ckp.bulan.getMonth() + 1);
    });

    let dataBulananexist = false;
    if (ckpBulanan.length > 0) {
      dataBulananexist = true;
    }
    return {
      tahun,
      dataTahunanExist,
      dataBulananexist,
      ckpTahunan,
      ckpBulanan,
    }
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
};

// tambah ckp
const tambahCkp = async (req, res) => {
  try {
    const { tahun, idDivisi } = req.body;
    const today = toDateObj(new Date());
    const awalTahun = toDateObj(new Date(`${tahun}-01-01`));
    const akhirTahun = toDateObj(new Date(`${tahun}-12-31`));

    let whereObj = {
      pegawai: { idDivisi },
      deleted: null,
    };
    let maxBulan = 12;
    if (today < akhirTahun) {
      whereObj.tglMulai = {
        gte: awalTahun,
        lte: today,
      };
      whereObj.tglSelesai = {
        gte: awalTahun,
        lte: today,
      };
      maxBulan = today.getMonth();
    } else {
      whereObj.tglMulai = {
        gte: awalTahun,
        lte: akhirTahun,
      };
      whereObj.tglSelesai = {
        gte: awalTahun,
        lte: akhirTahun,
      };
    }

    const aktivitas = await prisma.aktivitasPegawai.findMany({
      select: {
        id: true,
        tglMulai: true,
        tglSelesai: true,
        realisasi: true,
        pekerjaan: {
          select: {
            target: true,
            level: {
              select: { pengali: true },
            },
          },
        },
      },
      where: whereObj,
    });

    aktivitas.forEach(aktivitas => {
      aktivitas['bulanSelesai'] = aktivitas.tglSelesai.getMonth() + 1;
    });

    let totalCkpTahunan = 0;
    let maxCkpTahunan = 0;
    let totalCkpBulanan = [0, 0, 0, 0];
    let maxCkpBulanan = [0, 0, 0, 0];
    const maxPeriode = Math.floor(maxBulan / 3);
    aktivitas.forEach(aktivitas => {
      const nilaiAktivitas = (aktivitas.realisasi / aktivitas.pekerjaan.target) * aktivitas.pekerjaan.level.pengali;
      if (today > akhirTahun) {
        totalCkpTahunan += nilaiAktivitas;
        maxCkpTahunan += aktivitas.pekerjaan.level.pengali;
      }
      for (let i = Math.floor(aktivitas.bulanSelesai / 3) - 1; i < maxPeriode; i++) {
        totalCkpBulanan[i] += nilaiAktivitas;
        maxCkpBulanan[i] += aktivitas.pekerjaan.level.pengali;
      }
    });

    let ckpTahunan = null;
    if (maxCkpTahunan > 0) {
      ckpTahunan = Math.round(((totalCkpTahunan / maxCkpTahunan) * 100) * 100) / 100;
    }

    await prisma.ckpTahunanDivisi.upsert({
      create: {
        idDivisi,
        ckp: ckpTahunan,
        tahun: awalTahun,
      },
      update: {
        ckp: ckpTahunan,
      },
      where: {
        idDivisi_tahun: {
          idDivisi,
          tahun: awalTahun,
        },
      },
    });
    
    let ckpBulanan = [null, null, null, null];
    for (let i = 0; i < 4; i++) {
      if (maxCkpBulanan[i] > 0) {
        ckpBulanan[i] = Math.round(((totalCkpBulanan[i] / maxCkpBulanan[i]) * 100) * 100) / 100;
      }
      
      let bulanPeriode = (i + 1) * 3;
      bulanPeriode = toDateObj(`${tahun}-${bulanPeriode}-01`);
      await prisma.ckpBulananDivisi.upsert({
        create: {
          idDivisi,
          ckp: ckpBulanan[i],
          bulan: bulanPeriode,
        },
        update: {
          ckp: ckpBulanan[i],
        },
        where: {
          idDivisi_bulan: {
            idDivisi,
            bulan: bulanPeriode,
          },
        },
      });
    }
    
    req.session.alert = [{ msg: 'Data CKP berhasil ditambah/diperbarui'}];
    return {
      statusCode: 200,
    }
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
};

module.exports = {
  daftarCkp,
  tambahCkp,
};