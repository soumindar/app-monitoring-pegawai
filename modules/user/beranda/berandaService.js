const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getBaseUrl = require('../../../utils/getBaseUrl');
const toDateObj = require('../../../utils/toDateObj');

// data pegawai di beranda
const dataBeranda = async (req, res) => {
  try {
    const idPegawai = req.session.idPegawai;
    const pegawai = await prisma.pegawai.findFirst({
      select: {
        nip: true,
        nama: true,
        tglLahir: true,
        foto: true,
        jabatan: true,
        divisi: true,
      },
      where: { id: idPegawai },
    });

    if (!pegawai) {
      req.session.error = [{ msg: 'User tidak ditemukan' }];
      return {
        statusCode: 404,
      };
    }

    const baseUrl = getBaseUrl(req);
    pegawai.tglLahir = pegawai.tglLahir.getFullYear() + "-" + ("0"+(pegawai.tglLahir.getMonth()+1)).slice(-2) + "-" + ("0" + pegawai.tglLahir.getDate()).slice(-2);
    pegawai.foto = (!pegawai.foto) ? `${baseUrl}/img/user/no_avatar.jpeg` : `${baseUrl}/img/user/${idPegawai}/${pegawai.foto}`;

    const today = toDateObj(new Date());
    const akhirBulan = toDateObj(new Date(today.getFullYear(), today.getMonth()+1, 0));
    const awalbulan = toDateObj(new Date(today.getFullYear(), today.getMonth(), 1));
    const awalTahun = toDateObj(new Date(today.getFullYear(), 0, 1));
    const akhirTahun = toDateObj(new Date(today.getFullYear(), 11, 31));

    const getAktivitasBulanIni = await prisma.aktivitasPegawai.aggregate({
      _count: { id: true },
      where: {
        idPegawai,
        tglMulai: {
          lte: akhirBulan,
          gte: awalTahun,
        },
        tglSelesai: {
          gte: awalbulan,
          lte: akhirTahun,
        },
      }
    });

    const getAktivitasTahunIni = await prisma.aktivitasPegawai.aggregate({
      _count: { id: true },
      where: {
        idPegawai,
        tglMulai: {
          gte: awalTahun,
          lte: akhirTahun,
        },
        tglSelesai: {
          gte: awalTahun,
          lte: akhirTahun,
        },
      }
    });

    const aktivitasBulanIni = getAktivitasBulanIni._count.id;
    const aktivitasTahunIni = getAktivitasTahunIni._count.id;

    const aktivitasSelesai = await prisma.aktivitasPegawai.findMany({
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
        idPegawai,
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
    let realisasiKosong = 0;
    aktivitasSelesai.forEach(aktivitas => {
      const nilaiAktivitas = (aktivitas.realisasi / aktivitas.pekerjaan.target) * aktivitas.pekerjaan.level.pengali;
      totalCkp += nilaiAktivitas;
      maxCkp += aktivitas.pekerjaan.level.pengali;

      if (aktivitas.realisasi == 0) {
        realisasiKosong++;
      }
    });
    
    const progressCkp = Math.floor((totalCkp / maxCkp) * 100);

    const awalTahunLalu = toDateObj(new Date(today.getFullYear() - 1, 0, 1));
    const akhirTahunLalu = toDateObj(new Date(today.getFullYear() - 1, 11, 31));
    const aktivitasTahunLalu = await prisma.aktivitasPegawai.findMany({
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
        idPegawai,
        tglMulai: {
          gte: awalTahunLalu,
          lte: akhirTahunLalu,
        },
        tglSelesai: {
          gte: awalTahunLalu,
          lte: akhirTahunLalu,
        },
      },
    });

    let totalCkpSebelumnya = 0;
    let maxCkpSebelumnya = 0;
    if (aktivitasTahunLalu.length > 0) {
      aktivitasTahunLalu.forEach(aktivitas => {
        const nilaiAktivitas = (aktivitas.realisasi / aktivitas.pekerjaan.target) * aktivitas.pekerjaan.level.pengali;
        totalCkpSebelumnya += nilaiAktivitas;
        maxCkpSebelumnya += aktivitas.pekerjaan.level.pengali;
      });
    }
    
    let ckpTahunLalu = 0;
    if (maxCkpSebelumnya > 0) {
      ckpTahunLalu = Math.floor((totalCkpSebelumnya / maxCkpSebelumnya) * 100);
    }
    
    return {
      statusCode: 200,
      pegawai,
      aktivitasBulanIni,
      aktivitasTahunIni,
      progressCkp,
      realisasiKosong,
      ckpTahunLalu,
    };
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('user/error', {
      baseUrl,
      req,
      statusCode: 500,
    });
  }
};

module.exports = {
  dataBeranda,
}