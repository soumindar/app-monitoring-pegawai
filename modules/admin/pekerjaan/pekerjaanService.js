const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getBaseUrl = require('../../../utils/getBaseUrl');
const bcrypt = require('bcrypt');
const divisiService = require('../divisi/divisiService');

// ambil data pekerjaan berdasarkan divisi
const dataPekerjaanDivisi = async (req, res) => {
  try {
    const { page, idDivisi } = req.query;
    const currentPage = (Number(page) > 0) ? Number(page) : 1;
    const limit = 10;
    const offset = (currentPage - 1) * limit;
    
    const dataDivisi = await divisiService.dataDivisiId(req, res);
    if (!dataDivisi) {
      return {
        statusCode: 404,
      }
    }

    const data = await prisma.pekerjaan.findMany({
      select: {
        id: true,
        pekerjaan: true,
        durasi: true,
        target: true,
        satuanTarget: true,
        target: true,
        idLevel: true,
        idDivisi: true,
      },
      where: {
        idDivisi,
        deleted: null,
      },
      skip: offset,
      take: limit,
      orderBy: {
        pekerjaan: 'asc',
      }
    });

    const countPekerjaan = await prisma.pekerjaan.aggregate({
      _count: { id: true },
      where: {
        idDivisi,
        deleted: null,
      },
    });
    const totalData = Number(countPekerjaan._count.id);
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

// ambil data pekerjaan berdasarkan id
const dataPekerjaanId = async (req, res) => {
  try {
    const { id } = req.params;

    const idExist = await prisma.pekerjaan.findFirst({
      select: { id: true },
      where: {
        id,
        deleted: null,
      }
    });
    if (!idExist) {
      req.session.error = [{msg: 'ID pekerjaan tidak ditemukan'}];
      return {
        statusCode: 404,
      };
    }

    const data = await prisma.pekerjaan.findFirst({
      select: {
        id: true,
        pekerjaan: true,
        durasi: true,
        target: true,
        satuanTarget: true,
        idDivisi: true,
        idLevel: true,
      },
      where: { id },
    });
    
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

// tambah pekerjaan
const tambahPekerjaan = async (req, res) => {
  try {
    const { idDivisi, pekerjaan, satuanTarget, idLevel } = req.body;
    let { durasi, target } = req.body;
    durasi = Number(durasi);
    target = Number(target);
    
    const divisiExist = await prisma.divisi.findFirst({
      select: { id: true },
      where: {
        id: idDivisi,
        deleted: null,
      },
    });
    if (!divisiExist) {
      req.session.oldPekerjaan = { idDivisi, pekerjaan, durasi, target, satuanTarget, idLevel };
      req.session.error = [{msg: 'Divisi tidak ditemukan!'}];
      return {
        statusCode: 404,
      };
    }

    const levelExist = await prisma.level.findFirst({
      select: { id: true },
      where: {
        id: idLevel,
        deleted: null,
      },
    });
    if (!levelExist) {
      req.session.oldPekerjaan = { idDivisi, pekerjaan, durasi, target, satuanTarget, idLevel };
      req.session.error = [{msg: 'Level tidak ditemukan!'}];
      return {
        statusCode: 404,
      };
    }

    const pekerjaanExist = await prisma.pekerjaan.findFirst({
      select: { pekerjaan: true },
      where: { 
        pekerjaan,
        deleted: null,
      },
    });
    if (pekerjaanExist) {
      req.session.oldpekerjaan = { idDivisi, pekerjaan, durasi, target, satuanTarget, idLevel };
      req.session.error = [{msg: 'Pekerjaan sudah ada!'}];
      return {
        statusCode: 409,
      };
    }

    await prisma.pekerjaan.create({
      data: {
        idDivisi,
        pekerjaan,
        durasi,
        target,
        satuanTarget,
        idLevel,
      }
    });

    return {
      statusCode: 200,
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

// ubah data pekerjaan
const ubahPekerjaan = async (req, res) => {
  try {
    const { id } = req.params;
    const { idDivisi, pekerjaan, satuanTarget, idLevel } = req.body;
    let { durasi, target } = req.body;
    durasi = Number(durasi);
    target = Number(target);

    const idExist = await prisma.pekerjaan.findFirst({
      select: { id: true },
      where: {
        id,
        deleted: null,
      }
    });
    if (!idExist) {
      req.session.error = [{msg: 'ID pekerjaan tidak ditemukan'}];
      return {
        statusCode: 404,
      };
    }
    
    const divisiExist = await prisma.divisi.findFirst({
      select: { id: true },
      where: {
        id: idDivisi,
        deleted: null,
      },
    });
    if (!divisiExist) {
      req.session.oldPekerjaan = { idDivisi, pekerjaan, durasi, target, satuanTarget, idLevel };
      req.session.error = [{msg: 'Divisi tidak ditemukan!'}];
      return {
        statusCode: 404,
      };
    }

    const levelExist = await prisma.level.findFirst({
      select: { id: true },
      where: {
        id: idLevel,
        deleted: null,
      },
    });
    if (!levelExist) {
      req.session.oldPekerjaan = { idDivisi, pekerjaan, durasi, target, satuanTarget, idLevel };
      req.session.error = [{msg: 'Level tidak ditemukan!'}];
      return {
        statusCode: 404,
      };
    }

    const pekerjaanExist = await prisma.pekerjaan.findFirst({
      select: { pekerjaan: true },
      where: { 
        pekerjaan,
        id: {not: id},
        deleted: null,
      },
    });
    if (pekerjaanExist) {
      req.session.oldpekerjaan = { idDivisi, pekerjaan, durasi, target, satuanTarget, idLevel };
      req.session.error = [{msg: 'Pekerjaan sudah ada!'}];
      return {
        statusCode: 409,
      };
    }

    await prisma.pekerjaan.update({
      data: {
        idDivisi,
        pekerjaan,
        durasi,
        target,
        satuanTarget,
        idLevel,
      },
      where: { id },
    });

    return {
      statusCode: 200,
      idDivisi,
    };
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
};

// hapus pekerjaan
const hapusPekerjaan = async (req, res) => {
  try {
    const { id } = req.params;

    const idExist = await prisma.pekerjaan.findFirst({
      select: {
        id: true,
        idDivisi: true,
      },
      where: {
        id,
        deleted: null,
      }
    });
    if (!idExist) {
      req.session.error = [{msg: 'ID pekerjaan tidak ditemukan'}];
      return {
        statusCode: 404,
      };
    }
    
    await prisma.pekerjaan.delete({
      where: { id },
    });

    req.session.alert = [{ msg: 'Berhasil menghapus pekerjaan' }];
    return {
      statusCode: 200,
      idDivisi: idExist.idDivisi,
    };
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
};

module.exports ={
  dataPekerjaanDivisi,
  dataPekerjaanId,
  tambahPekerjaan,
  ubahPekerjaan,
  hapusPekerjaan,
};