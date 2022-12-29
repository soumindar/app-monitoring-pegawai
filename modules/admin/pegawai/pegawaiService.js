const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getBaseUrl = require('../../../utils/getBaseUrl');
const bcrypt = require('bcrypt');
const toDateObj = require('../../../utils/toDateObj');

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

// data detail pegawai
const detailPegawai = async (req, res) => {
  try {
    const { idPegawai } = req.params;
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
      console.log('username exist');
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

module.exports = {
  dataPegawai,
  dataPegawaiId,
  detailPegawai,
  tambahPegawai,
  ubahPegawai,
  ubahPassword,
  hapusPegawai,
};