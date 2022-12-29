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
    const awalTahun = toDateObj(new Date(today.getFullYear(), 0, 1));
    const akhirTahun = toDateObj(new Date(today.getFullYear(), 11, 31));
    const getJmlAktivitas = await prisma.aktivitasPegawai.aggregate({
      _count: { id: true },
      where: {
        deleted: null,
        tglMulai: {
          gte: awalTahun,
          lte: akhirTahun,
        },
        tglSelesai: {
          gte: awalTahun,
          lte: akhirTahun,
        },
      },
    });
    const jmlAktivitas = getJmlAktivitas._count.id;

    // progress ckp tahun ini
    const aktivitasSelesai = await prisma.aktivitasPegawai.findMany({
      select: {
        id: true,
        tglMulai: true,
        tglSelesai: true,
        realisasi: true,
        pekerjaan: {
          select: {
            target: true,
            divisi: {
              select : { id: true },
            },
            level: {
              select: { pengali: true },
            },
          },
        },
      },
      where: {
        deleted: null,
        tglMulai: {
          gte: awalTahun,
          lte: today,
        },
        tglSelesai: {
          gte: awalTahun,
          lte: today,
        }
      }
    });

    let totalCkp = 0;
    let maxCkp = 0;
    if (aktivitasSelesai.length > 0) {
      aktivitasSelesai.forEach(aktivitas => {
        const nilaiAktivitas = (aktivitas.realisasi / aktivitas.pekerjaan.target) * aktivitas.pekerjaan.level.pengali;
        totalCkp += nilaiAktivitas;
        maxCkp += aktivitas.pekerjaan.level.pengali;
  
        if (aktivitas.realisasi == 0) {
          realisasiKosong++;
        }
      });
    }
    
    let progressCkp = 0;
    if (maxCkp > 0) {
      progressCkp = Math.floor((totalCkp / maxCkp) * 100);
    }

    // jumlah realisasi belum lengkap
    const getRealisasiKosong = await prisma.aktivitasPegawai.aggregate({
      _count: { id: true },
      where: {
        deleted: null,
        realisasi: null,
        tglMulai: {
          gte: awalTahun,
          lte: today,
        },
        tglSelesai: {
          gte: awalTahun,
          lte: today,
        }
      }
    });
    const realisasiKosong = getRealisasiKosong._count.id;

    // data ckp keseluruhan
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
      where: {
        deleted: null,
        tglMulai: {
          gte: awalTahun,
          lte: akhirTahun,
        },
        tglSelesai: {
          gte: awalTahun,
          lte: akhirTahun,
        },
      },
    });

    aktivitas.forEach(aktivitas => {
      aktivitas['bulanMulai'] = aktivitas.tglMulai.getMonth();
      aktivitas['bulanSelesai'] = aktivitas.tglSelesai.getMonth();
    });

    const labelBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    let totalCkpBulanan = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let maxCkpBulanan = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    if (aktivitas.length > 0) {
      aktivitas.forEach(aktivitas => {
        const nilaiAktivitas = (aktivitas.realisasi / aktivitas.pekerjaan.target) * aktivitas.pekerjaan.level.pengali;
        for (let i = aktivitas.bulanSelesai; i < 12; i++) {
          totalCkpBulanan[i] += nilaiAktivitas;
          maxCkpBulanan[i] += aktivitas.pekerjaan.level.pengali;
        }
      });
    }

    let ckpBulanan = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 12; i++) {
      if (maxCkpBulanan[i] > 0) {
        ckpBulanan[i] = Math.floor((totalCkpBulanan[i] / maxCkpBulanan[i] * 100));
      }
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
    let jmlPegawaiDivisi = [];
    divisi.forEach(divisi => {
      labelDivisi.push(divisi.divisi);
      jmlPegawaiDivisi.push(pegawai.filter(pegawai => pegawai.idDivisi == divisi.id).length);
    });

    // progress ckp per divisi
    let totalCkpDivisi = [];
    let maxCkpDivisi = [];
    let progressCkpDivisi  = [];
    for (let i = 0; i < divisi.length; i++) {
      totalCkpDivisi.push(0);
      maxCkpDivisi.push(0);
      progressCkpDivisi.push(0);
    }

    let dataIdDivisi = [];
    divisi.forEach(divisi => {
      dataIdDivisi.push(divisi.id);
    });

    if (aktivitasSelesai.length > 0) {
      aktivitasSelesai.forEach(aktivitas => {
        const nilaiAktivitas = (aktivitas.realisasi / aktivitas.pekerjaan.target) * aktivitas.pekerjaan.level.pengali;
        const indexDivisi = dataIdDivisi.indexOf(aktivitas.pekerjaan.divisi.id);
        totalCkpDivisi[indexDivisi] += nilaiAktivitas;
        maxCkpDivisi[indexDivisi] += aktivitas.pekerjaan.level.pengali;
      });
    }
    
    for (let i = 0; i < divisi.length; i++) {
      if (maxCkpDivisi[i] > 0) {
        progressCkpDivisi[i] = Math.floor((totalCkpDivisi[i] / maxCkpDivisi[i]) * 100);
      }
    }

    return {
      divisi,
      jmlPegawai,
      jmlAktivitas,
      progressCkp,
      realisasiKosong,
      ckpKeseluruhan: {
        data: ckpBulanan,
        label: labelBulan,
      },
      distribusiPegawai: {
        data: jmlPegawaiDivisi,
        label: labelDivisi,
      },
      ckpDivisi: {
        data: progressCkpDivisi,
        label: labelDivisi,
      }
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
  dataBeranda,
};