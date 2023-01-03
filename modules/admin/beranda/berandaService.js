const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getBaseUrl = require('../../../utils/getBaseUrl');
const toDateObj = require('../../../utils/toDateObj');

// data beranda
const dataBeranda = async (req, res) => {
  try {
    // jumlah pegawai
    const getJmlPegawai = await prisma.pegawai.aggregate({
      _count: { id: true },
      where: { deleted: null },
    });
    const jmlPegawai = getJmlPegawai._count.id;

    // jumlah aktivitas tahun ini
    const today = toDateObj(new Date());
    const tahunIni = today.getFullYear();
    const bulanIni = today.getMonth();
    const awalTahunIni = toDateObj(new Date(tahunIni, 0, 1));
    const akhirTahunIni = toDateObj(new Date(tahunIni, 11, 31));
    const aktivitasTahunIni = await prisma.aktivitasPegawai.findMany({
      select: {
        realisasi: true
      },
      where: {
        deleted: null,
        tglMulai: {
          gte: awalTahunIni,
          lte: akhirTahunIni,
        },
        tglSelesai: {
          gte: awalTahunIni,
          lte: akhirTahunIni,
        },
      },
    });
    const jmlAktivitas = aktivitasTahunIni.length;

    // progress ckp tahun ini
    let periodeTerakhir = Math.floor(bulanIni / 3) * 3;
    if (periodeTerakhir == 0) periodeTerakhir = 1;
    periodeTerakhir = toDateObj(new Date(tahunIni, periodeTerakhir - 1, 1));   
    const getProgressCkp = await prisma.ckpBulananKeseluruhan.findFirst({
      select: { ckp: true },
      where: {
        bulan: periodeTerakhir,
      },
    });
    let progressCkp = null;
    if (getProgressCkp) progressCkp = getProgressCkp.ckp;

    // jumlah realisasi kosong tahun ini
    const getRealisasiKosong = await prisma.aktivitasPegawai.findMany({
      select: {
        pegawai: {
          select: { nama: true },
        },
      },
      where: {
        deleted: null,
        realisasi: null,
        tglMulai: {
          gte: awalTahunIni,
          lte: today,
        },
        tglSelesai: {
          gte: awalTahunIni,
          lte: today,
        }
      }
    });
    const realisasiKosong = getRealisasiKosong.length;

    // data distribusi pegawai tiap divisi
    const divisi = await prisma.divisi.findMany({
      select: {
        id: true,
        divisi: true,
      },
      where: { deleted: null }
    });
    
    const pegawai = await prisma.pegawai.findMany({
      select: { idDivisi: true },
      where: { deleted: null },
    });

    let labelDivisi = [];
    let dataIdDivisi = [];
    let jmlPegawaiDivisi = [];
    divisi.forEach(divisi => {
      labelDivisi.push(divisi.divisi);
      dataIdDivisi.push(divisi.id);
      jmlPegawaiDivisi.push(pegawai.filter(pegawai => pegawai.idDivisi == divisi.id).length);
    });

    return {
      jmlPegawai,
      jmlAktivitas,
      progressCkp,
      realisasiKosong,
      distribusiPegawai: {
        data: jmlPegawaiDivisi,
        label: labelDivisi,
      },
    };
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
};

// data ckp keseluruhan
const ckpKeseluruhan = async (req, res) => {
  try {
    let { tampilan, tahunAwal, tahunAkhir } = req.query;

    const today = toDateObj(new Date());
    tampilan = tampilan ?? 'bulanan';
    tahunAwal = tahunAwal ?? today.getFullYear();
    tahunAkhir = tahunAkhir ?? today.getFullYear();
    req.query.tahunAwal = tahunAwal;
    req.query.tahunAkhir = tahunAkhir;

    let ckpKeseluruhan = [];
    let labelKeseluruhan = [];
    if (tampilan == 'bulanan') {
      const awalTahun = toDateObj(new Date(tahunAwal, 0, 1));
      const akhirTahun = toDateObj(new Date(tahunAwal, 11, 31));
      const getCkpKeseluruhan = await prisma.ckpBulananKeseluruhan.findMany({
        select: {
          ckp: true,
          bulan: true,
        },
        where: {
          bulan: {
            gte: awalTahun,
            lte: akhirTahun,
          }
        },
        orderBy: { bulan: 'asc' },
      });

      getCkpKeseluruhan.forEach(ckp => {
        ckpKeseluruhan.push(ckp.ckp);
      });

      labelKeseluruhan = ['Maret', 'Juni', 'September', 'Desember'];
    } else {
      const awalTahun = toDateObj(new Date(tahunAwal, 0, 1));
      const akhirTahun = toDateObj(new Date(tahunAkhir, 11, 31));
      const getCkpKeseluruhan = await prisma.ckpTahunanKeseluruhan.findMany({
        select: {
          ckp: true,
          tahun: true,
        },
        where: {
          tahun: {
            gte: awalTahun,
            lte: akhirTahun,
          }
        },
        orderBy: { tahun: 'asc' },
      });

      const jmlTahun = akhirTahun.getFullYear() - awalTahun.getFullYear() + 1;
      for (let i = 0; i < jmlTahun; i++) {
        ckpKeseluruhan.push(null);
        labelKeseluruhan.push(Number(tahunAwal) + i);
      }

      getCkpKeseluruhan.forEach(ckp => {
        ckpKeseluruhan[labelKeseluruhan.indexOf(Number(ckp.tahun.getFullYear()))] = ckp.ckp;
      });

    }

    return {
      ckpKeseluruhan: {
        data: ckpKeseluruhan,
        label: labelKeseluruhan,
      },
    }
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
};

// data ckp per divisi
const ckpPerDivisi = async (req, res) => {
  try {
    let { tahun } = req.query;
    const today = toDateObj(new Date());
    tahun = tahun ?? today.getFullYear();
    req.query.tahun = tahun;
    const awalTahun = toDateObj(new Date(`${tahun}-01-01`));

    const getCkpPerDivisi = await prisma.ckpTahunanDivisi.findMany({
      select: {
        ckp: true,
        idDivisi: true,
      },
      where: {
        tahun: awalTahun,
      },
    });

    const divisi = await prisma.divisi.findMany({
      select: {
        id: true,
        divisi: true,
      },
      where: { deleted: null },
    });
    
    let labelDivisi = [];
    let dataIdDivisi = [];
    divisi.forEach(divisi => {
      labelDivisi.push(divisi.divisi);
      dataIdDivisi.push(divisi.id);
    });

    let ckpPerDivisi = new Array(divisi.length).fill(null);
    getCkpPerDivisi.forEach(ckp => {
      ckpPerDivisi[dataIdDivisi.indexOf(ckp.idDivisi)] = ckp.ckp;
    });

    return {
      ckpPerDivisi: {
        data: ckpPerDivisi,
        label: labelDivisi,
      },
    }
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
};

// data ckp divisi
const ckpDivisi = async (req, res) => {
  try {
    let { tampilan, tahunAwal, tahunAkhir, idDivisi } = req.query;
    let namaDivisi = '';
    if (idDivisi) {
      const divisiExist = await prisma.divisi.findFirst({
        select: { divisi: true },
        where: {
          id: idDivisi,
          deleted: null,
        },
      });
      if (!divisiExist) {
        req.session.error = [{ msg: 'ID divisi tidak ditemukan' }];
        return {
          statusCode: 404,
        };
      }
      namaDivisi = divisiExist.divisi;
    }

    const today = toDateObj(new Date());
    tampilan = tampilan ?? 'bulanan';
    tahunAwal = tahunAwal ?? today.getFullYear();
    tahunAkhir = tahunAkhir ?? today.getFullYear();
    req.query.tahunAwal = tahunAwal;
    req.query.tahunAkhir = tahunAkhir;

    let ckpDivisi = [];
    let label = [];
    if (tampilan == 'bulanan') {
      const awalTahun = toDateObj(new Date(tahunAwal, 0, 1));
      const akhirTahun = toDateObj(new Date(tahunAwal, 11, 31));
      const getCkpDivisi = await prisma.ckpBulananDivisi.findMany({
        select: {
          ckp: true,
          bulan: true,
        },
        where: {
          idDivisi,
          bulan: {
            gte: awalTahun,
            lte: akhirTahun,
          }
        },
        orderBy: { bulan: 'asc' },
      });

      getCkpDivisi.forEach(ckp => {
        ckpDivisi.push(ckp.ckp);
      });

      label = ['Maret', 'Juni', 'September', 'Desember'];
    } else {
      const awalTahun = toDateObj(new Date(tahunAwal, 0, 1));
      const akhirTahun = toDateObj(new Date(tahunAkhir, 11, 31));
      const getCkpDivisi = await prisma.ckpTahunanDivisi.findMany({
        select: {
          ckp: true,
          tahun: true,
        },
        where: {
          idDivisi,
          tahun: {
            gte: awalTahun,
            lte: akhirTahun,
          }
        },
        orderBy: { tahun: 'asc' },
      });

      const jmlTahun = akhirTahun.getFullYear() - awalTahun.getFullYear() + 1;
      for (let i = 0; i < jmlTahun; i++) {
        ckpDivisi.push(null);
        label.push(Number(tahunAwal) + i);
      }

      getCkpDivisi.forEach(ckp => {
        ckpDivisi[label.indexOf(Number(ckp.tahun.getFullYear()))] = ckp.ckp;
      });

    }

    return {
      namaDivisi,
      ckpDivisi: {
        data: ckpDivisi,
        label,
      },
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
  dataBeranda,
  ckpKeseluruhan,
  ckpPerDivisi,
  ckpDivisi,
};