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

    // jumlah realisasi belum lengkap
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

    // data ckp keseluruhan
    let { tampilanKsl, tahunAwalKsl, tahunAkhirKsl } = req.query;
    tampilanKsl = tampilanKsl ?? 'bulanan';
    tahunAwalKsl = tahunAwalKsl ?? today.getFullYear();
    tahunAkhirKsl = tahunAkhirKsl ?? today.getFullYear();
    req.query.tahunAwalKsl = tahunAwalKsl;

    let ckpKeseluruhan = [];
    let labelKeseluruhan = [];
    if (tampilanKsl == 'bulanan') {
      const awalTahunKsl = toDateObj(new Date(tahunAwalKsl, 0, 1));
      const akhirTahunKsl = toDateObj(new Date(tahunAwalKsl, 11, 31));
      const getCkpKeseluruhan = await prisma.ckpBulananKeseluruhan.findMany({
        select: {
          ckp: true,
          bulan: true,
        },
        where: {
          bulan: {
            gte: awalTahunKsl,
            lte: akhirTahunKsl,
          }
        },
        orderBy: { bulan: 'asc' },
      });

      getCkpKeseluruhan.forEach(ckp => {
        ckpKeseluruhan.push(ckp.ckp);
      });

      labelKeseluruhan = ['Maret', 'Juni', 'September', 'Desember'];
    } else {
      const awalTahunKsl = toDateObj(new Date(tahunAwalKsl, 0, 1));
      const akhirTahunKsl = toDateObj(new Date(tahunAkhirKsl, 11, 31));
      const getCkpKeseluruhan = await prisma.ckpTahunanKeseluruhan.findMany({
        select: {
          ckp: true,
          tahun: true,
        },
        where: {
          tahun: {
            gte: awalTahunKsl,
            lte: akhirTahunKsl,
          }
        },
        orderBy: { tahun: 'asc' },
      });

      for (let i = 0; i < 3; i++) {
        ckpKeseluruhan.push(null);
        labelKeseluruhan.push(Number(tahunAwalKsl) + i);
      }

      getCkpKeseluruhan.forEach(ckp => {
        ckpKeseluruhan[labelKeseluruhan.indexOf(Number(ckp.tahun.getFullYear()))] = ckp.ckp;
      });

    }

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

    // progress ckp per divisi
    const getProgressCkpDivisi = await prisma.ckpBulananDivisi.findMany({
      select: {
        ckp: true,
        idDivisi: true,
      },
      where: {
        bulan: periodeTerakhir,
      },
    });

    let progressCkpDivisi = new Array(divisi.length).fill(null);
    getProgressCkpDivisi.forEach(ckp => {
      progressCkpDivisi[dataIdDivisi.indexOf(ckp.idDivisi)] = ckp.ckp;
    });

    return {
      // divisi,
      jmlPegawai,
      jmlAktivitas,
      progressCkp,
      realisasiKosong,
      ckpKeseluruhan: {
        data: ckpKeseluruhan,
        label: labelKeseluruhan,
      },
      distribusiPegawai: {
        data: jmlPegawaiDivisi,
        label: labelDivisi,
      },
      progressCkpDivisi: {
        data: progressCkpDivisi,
        label: labelDivisi,
      },
      // pegawaiKosong,
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
  dataBeranda,
};