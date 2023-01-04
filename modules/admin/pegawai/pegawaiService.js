const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getBaseUrl = require('../../../utils/getBaseUrl');
const bcrypt = require('bcrypt');
const toDateObj = require('../../../utils/toDateObj');
const toDateHtml = require('../../../utils/toDateHtml');

// ambil data pegawai
const dataPegawai = async (req, res) => {
  try {
    const { page } = req.query;
    const currentPage = (Number(page) > 0) ? Number(page) : 1;
    const limit = 10;
    const offset = (currentPage - 1) * limit;
    
    let data = await prisma.pegawai.findMany({
      select: {
        id: true,
        nip: true,
        nama: true,
        idJabatan: true,
        idDivisi: true,
        jabatan: {
          select: { jabatan: true },
        },
        divisi: {
          select: { divisi: true },
        },
      },
      where: {
        deleted: null,
      },
      skip: offset,
      take: limit,
      orderBy: {
        nama: 'asc',
      }
    });

    const countPegawai = await prisma.pegawai.aggregate({
      _count: { id: true },
    });
    const totalData = Number(countPegawai._count.id);
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

// ambil data pegawai berdasarkan id di params
const dataPegawaiId = async (req, res) => {
  try {
    const { id } = req.params;

    const idExist = await prisma.pegawai.findFirst({
      select: { id: true },
      where: {
        id,
        deleted: null,
      }
    });
    if (!idExist) {
      req.session.error = [{msg: 'ID pegawai tidak ditemukan'}];
      return {
        statusCode: 404,
      };
    }

    let data = await prisma.pegawai.findFirst({
      select: {
        id: true,
        nip: true,
        nama: true,
        tglLahir: true,
        idJabatan: true,
        idDivisi: true,
        username: true,
      },
      where: { id },
    });
    data.tglLahir = data.tglLahir.getFullYear() + "-" + ("0"+(data.tglLahir.getMonth()+1)).slice(-2) + "-" + ("0" + data.tglLahir.getDate()).slice(-2);
    
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
};

// tambah pegawai
const tambahPegawai = async (req, res) => {
  try {
    const { nip, nama, tglLahir, idJabatan, idDivisi, username, password } = req.body;
    
    const nipExist = await prisma.pegawai.findFirst({
      select: { nip: true },
      where: { 
        nip,
        deleted: null,
      },
    });
    if (nipExist) {
      req.session.oldPegawai = { nip, nama, tglLahir, idJabatan, idDivisi, username };
      req.session.error = [{msg: 'NIP sudah dimiliki oleh pegawai lain'}];
      return {
        statusCode: 409,
      };
    }

    const usernameExist = await prisma.pegawai.findFirst({
      select: { username: true },
      where: { username },
    });
    if (usernameExist) {
      req.session.oldPegawai = { nip, nama, tglLahir, idJabatan, idDivisi, username };
      req.session.error = [{msg: 'Username sudah digunakan oleh pegawai lain'}];
      return {
        statusCode: 409,
      };
    }

    const objTglLahir = new Date(tglLahir);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await prisma.pegawai.create({
      data: {
        nip,
        nama,
        tglLahir: objTglLahir,
        idJabatan,
        idDivisi,
        username,
        password: hashedPassword,
      }
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

// ubah data pegawai
const ubahPegawai = async (req, res) => {
  try {
    const { id } = req.params;
    const { nip, nama, tglLahir, idJabatan, idDivisi, username } = req.body;

    const idExist = await prisma.pegawai.findFirst({
      select: { id: true },
      where: {
        id,
        deleted: null,
      }
    });
    if (!idExist) {
      req.session.error = [{msg: 'ID pegawai tidak ditemukan'}];
      return {
        statusCode: 404,
      };
    }

    const nipExist = await prisma.pegawai.findFirst({
      select: { nip: true },
      where: {
        nip,
        id: {not: id},
        deleted: null,
      },
    });
    if (nipExist) {
      req.session.oldPegawai = { nip, nama, tglLahir, idJabatan, idDivisi, username };
      req.session.error = [{msg: 'NIP sudah dimiliki oleh pegawai lain'}];
      return {
        statusCode: 409,
      };
    }

    const usernameExist = await prisma.pegawai.findFirst({
      select: { username: true },
      where: {
        username,
        id: {not: id},
      },
    });
    if (usernameExist) {
      req.session.oldPegawai = { nip, nama, tglLahir, idJabatan, idDivisi, username };
      req.session.error = [{msg: 'Username sudah digunakan oleh pegawai lain'}];
      return {
        statusCode: 409,
      };
    }

    const objTglLahir = new Date(tglLahir);
    await prisma.pegawai.update({
      data: {
        nip,
        nama,
        tglLahir: objTglLahir,
        idJabatan,
        idDivisi,
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

// ubah password
const ubahPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword, passwordConfirm } = req.body;

    const idExist = await prisma.pegawai.findFirst({
      select: {
        id: true,
        password: true,
      },
      where: {
        id,
        deleted: null,
      },
    });
    if (!idExist) {
      req.session.error = [{msg: 'ID pegawai tidak ditemukan'}];
      return {
        statusCode: 404,
      }
    }

    const passwordMatch = bcrypt.compareSync(oldPassword, idExist.password);
    if (!passwordMatch) {
      req.session.error = [{msg: 'Password lama salah!'}];
      return {
        statusCode: 401,
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await prisma.pegawai.update({
      data: { password: hashedPassword },
      where: { id }
    });

    req.session.alert = [{msg: 'Password berhasil diubah'}];
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

// hapus pegawai
const hapusPegawai = async (req, res) => {
  try {
    const { id } = req.params;

    const idExist = await prisma.pegawai.findFirst({
      select: {
        id: true,
      },
      where: {
        id,
        deleted: null,
      },
    });
    if (!idExist) {
      req.session.error = [{msg: 'ID pegawai tidak ditemukan'}];
      return {
        statusCode: 404,
      }
    }
    
    await prisma.pegawai.delete({
      where: { id },
    });

    req.session.alert = [{ msg: 'Berhasil menghapus pegawai' }];
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

// data detail pegawai
const detailPegawai = async (req, res) => {
  try {
    const { idPegawai } = req.params;
    
    const today = toDateObj(new Date());
    const bulanIni = today.getMonth();
    const tahunIni = today.getFullYear();
    const akhirBulanIni = toDateObj(new Date(tahunIni, bulanIni+1, 0));
    const awalbulanIni = toDateObj(new Date(tahunIni, bulanIni, 1));
    const awalTahunIni = toDateObj(new Date(tahunIni, 0, 1));
    const akhirTahunIni = toDateObj(new Date(tahunIni, 11, 31));
    
    // aktivitas bulan ini
    const getAktivitasBulanIni = await prisma.aktivitasPegawai.aggregate({
      _count: { id: true },
      where: {
        idPegawai,
        deleted: null,
        tglMulai: {
          lte: akhirBulanIni,
          gte: awalTahunIni,
        },
        tglSelesai: {
          gte: awalbulanIni,
          lte: akhirTahunIni,
        },
      }
    });

    const aktivitasBulanIni = getAktivitasBulanIni._count.id;

    // aktivitas tahun ini
    const getAktivitasTahunIni = await prisma.aktivitasPegawai.aggregate({
      _count: { id: true },
      where: {
        idPegawai,
        deleted: null,
        tglMulai: {
          gte: awalTahunIni,
          lte: akhirTahunIni,
        },
        tglSelesai: {
          gte: awalTahunIni,
          lte: akhirTahunIni,
        },
      }
    });
    
    const aktivitasTahunIni = getAktivitasTahunIni._count.id;

    // progress ckp tahun ini
    let periodeTerakhir = Math.floor(bulanIni / 3) * 3;
    if (periodeTerakhir == 0) periodeTerakhir = 1;
    periodeTerakhir = toDateObj(new Date(tahunIni, periodeTerakhir - 1, 1));   
    const getProgressCkp = await prisma.ckpBulananPegawai.findFirst({
      select: { ckp: true },
      where: {
        bulan: periodeTerakhir,
      },
    });
    let progressCkp = null;
    if (getProgressCkp) progressCkp = getProgressCkp.ckp;

    // realisasi kosong
    const getRealisasiKosong = await prisma.aktivitasPegawai.findMany({
      select: {
        id: true,
      },
      where: {
        idPegawai,
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

    // data diri pegawai
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

    // ckp tahun lalu
    const tahunLalu = toDateObj(new Date(tahunIni - 1, 0, 1));
    const ckpTahunLalu = await prisma.ckpTahunanPegawai.findFirst({
      select: { ckp: true },
      where: {
        idPegawai,
        tahun: tahunLalu,
      },
    });
    
    return {
      statusCode: 200,
      pegawai,
      aktivitasBulanIni,
      aktivitasTahunIni,
      progressCkp,
      realisasiKosong,
      ckpTahunLalu: ckpTahunLalu.ckp,
      tahunLalu: tahunLalu.getFullYear(),
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

// data grafik ckp
const dataCkp = async (req, res) => {
  try {
    const { idPegawai } = req.params;
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
      const getCkpKeseluruhan = await prisma.ckpBulananPegawai.findMany({
        select: {
          ckp: true,
          bulan: true,
        },
        where: {
          idPegawai,
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
      const getCkpKeseluruhan = await prisma.ckpTahunanPegawai.findMany({
        select: {
          ckp: true,
          tahun: true,
        },
        where: {
          idPegawai,
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
    return res.render('user/error', {
      baseUrl,
      req,
      statusCode: 500,
    });
  }
};

// data realisasi kosong
const realisasiKosong = async (req, res) => {
  try {
    const { idPegawai } = req.params;
    let { tahun } = req.query;
    const { page } = req.query;

    const today = toDateObj(new Date());
    tahun = tahun ?? today.getFullYear();
    req.query.tahun = tahun;
    const awalTahun = toDateObj(new Date(tahun, 0, 1));
    const akhirTahun = toDateObj(new Date(tahun, 11, 31));

    const currentPage = (Number(page) > 0) ? Number(page) : 1;
    const limit = 10;
    const offset = (currentPage - 1) * limit;

    let whereObj = {
      deleted: null,
      idPegawai,
      realisasi: null,
    };

    if (today < akhirTahun) {
      whereObj.tglMulai = {
        gte: awalTahun,
        lte: today,
      };
      whereObj.tglSelesai = {
        gte: awalTahun,
        lte: today,
      };
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

    let aktivitas = await prisma.aktivitasPegawai.findMany({
      select: {
        pekerjaan: {
          select: {
            pekerjaan: true,
          }
        },
        tglMulai: true,
        tglSelesai: true,
      },
      where: whereObj,
      skip: offset,
      take: limit,
      orderBy: [
        { tglSelesai: 'desc' },
        { tglMulai: 'desc' },
      ],
    });

    aktivitas.forEach(aktivitas => {
      aktivitas.tglMulai = toDateHtml(aktivitas.tglMulai);
      aktivitas.tglSelesai = toDateHtml(aktivitas.tglSelesai);
    });

    const getTotalData = await prisma.aktivitasPegawai.aggregate({
      _count: { id: true },
      where: whereObj,
    });

    const totalData = getTotalData._count.id;
    const totalPage = Math.ceil(totalData / limit);

    return {
      statusCode: 200,
      aktivitas,
      currentPage,
      totalPage,
    }
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
  dataPegawai,
  dataPegawaiId,
  tambahPegawai,
  ubahPegawai,
  ubahPassword,
  hapusPegawai,
  detailPegawai,
  dataCkp,
  realisasiKosong,
};