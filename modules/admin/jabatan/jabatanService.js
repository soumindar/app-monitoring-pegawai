const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getBaseUrl = require('../../../utils/getBaseUrl');

// ambil semua data jabatan
const dataLengkap = async (req, res) => {
  try {
    const getData = await prisma.jabatan.findMany({
      select: {
        id: true,
        jabatan: true,
      },
      where: {
        deleted: null
      },
    });

    return {
      statusCode: 200,
      data: getData,
    }
  } catch (error) {
    const baseUrl = getBaseUrl(req);
    return res.render('admin/error', {
      baseUrl,
      statusCode: 500,
    });
  }
};

// ambil data jabatan dengan pagination
const dataPagination = async (req, res) => {
  try {
    const { page, search } = req.query;
    const currentPage = (Number(page) > 0) ? Number(page) : 1;
    const limit = 10;
    const offset = (currentPage - 1) * limit;
    
    let whereObj =  { deleted: null };
    if (search) {
      whereObj.jabatan = {
        contains: search,
        mode: 'insensitive',
      };
    }

    let data = await prisma.jabatan.findMany({
      select: {
        id: true,
        jabatan: true,
        keterangan: true,
      },
      where: whereObj,
      skip: offset,
      take: limit,
      orderBy: {
        jabatan: 'asc',
      }
    });

    const countJabatan = await prisma.jabatan.aggregate({
      _count: { id: true },
    });
    const totalData = Number(countJabatan._count.id);
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

// ambil data jabatan berdasarkan id
const dataJabatanId = async (req, res) => {
  try {
    const { id } = req.params;

    const idExist = await prisma.jabatan.findFirst({
      select: { id: true },
      where: {
        id,
        deleted: null,
      }
    });
    if (!idExist) {
      req.session.error = [{msg: 'ID jabatan tidak ditemukan'}];
      return {
        statusCode: 404,
      };
    }

    let data = await prisma.jabatan.findFirst({
      select: {
        id: true,
        jabatan: true,
        keterangan: true,
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

// tambah jabatan
const tambahJabatan = async (req, res) => {
  try {
    const { jabatan, keterangan } = req.body;
    
    const jabatanExist = await prisma.jabatan.findFirst({
      select: { jabatan: true },
      where: { 
        jabatan,
        deleted: null,
      },
    });
    if (jabatanExist) {
      req.session.oldJabatan = { jabatan, keterangan };
      req.session.error = [{msg: 'Jabatan sudah ada'}];
      return {
        statusCode: 409,
      };
    }

    await prisma.jabatan.create({
      data: {
        jabatan,
        keterangan,
      },
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

// ubah data jabatan
const ubahJabatan = async (req, res) => {
  try {
    const { id } = req.params;
    const { jabatan, keterangan } = req.body;

    const idExist = await prisma.jabatan.findFirst({
      select: { id: true },
      where: {
        id,
        deleted: null,
      }
    });
    if (!idExist) {
      req.session.error = [{msg: 'ID jabatan tidak ditemukan'}];
      return {
        statusCode: 404,
      };
    }

    const jabatanExist = await prisma.jabatan.findFirst({
      select: { jabatan: true },
      where: { 
        jabatan,
        id: {not: id},
        deleted: null,
      },
    });
    if (jabatanExist) {
      req.session.oldJabatan = { jabatan, keterangan };
      req.session.error = [{msg: 'Jabatan sudah ada'}];
      return {
        statusCode: 409,
      };
    }

    await prisma.jabatan.update({
      data: {
        jabatan,
        keterangan,
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

// hapus jabatan
const hapusJabatan = async (req, res) => {
  try {
    const { id } = req.params;

    const idExist = await prisma.jabatan.findFirst({
      select: { id: true },
      where: {
        id,
        deleted: null,
      }
    });
    if (!idExist) {
      req.session.error = [{msg: 'ID jabatan tidak ditemukan'}];
      return {
        statusCode: 404,
      };
    }
    
    await prisma.jabatan.delete({
      where: { id },
    });

    req.session.alert = [{ msg: 'Berhasil menghapus jabatan' }];
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
  dataLengkap,
  dataPagination,
  dataJabatanId,
  tambahJabatan,
  ubahJabatan,
  hapusJabatan,
};