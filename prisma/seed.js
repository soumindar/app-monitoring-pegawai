const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

(async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin-sou123', salt);

    await prisma.admin.create({
      data: {
        nama: 'Soumindar Qolby',
        username: 'admin-sou',
        password: hashedPassword,
      }
    });
    
    await prisma.jabatan.createMany({
      data: [
        { jabatan: 'Direktur' },
        { jabatan: 'Sekretaris' },
        { jabatan: 'Bendahara' },
        { jabatan: 'Manajer' },
        { jabatan: 'Pegawai' },
      ]
    });

    await prisma.divisi.createMany({
      data: [
        { divisi: 'Marketing' },
        { divisi: 'IT' },
        { divisi: 'Keuangan' },
        { divisi: 'HRD' },
        { divisi: 'Umum'},
      ]
    });

    await prisma.pekerjaan.createMany({
      data: [
        {
          pekerjaan: 'membuat poster pemasaran produk',
          durasi: 14,
          target: 2,
          satuanTarget: 'buah',
        },
        {
          pekerjaan: 'membuat video pemasaran produk',
          durasi: 21,
          target: 1,
          satuanTarget: 'buah',
        },
        {
          pekerjaan: 'mengelola sosial media perusahaan',
          durasi: 90,
          target: 5,
          satuanTarget: 'media sosial',
        },
        {
          pekerjaan: 'membuat rencana dan strategi pemasaran',
          durasi: 30,
          target: 1,
          satuanTarget: 'dokumen',
        },
        {
          pekerjaan: 'membuat analisis sistem',
          durasi: 14,
          target: 1,
          satuanTarget: 'dokumen'
        },
        {
          pekerjaan: 'mengerjakan sistem front-end',
          durasi: 30,
          target: 100,
          satuanTarget: 'persen',
        },
        {
          pekerjaan: 'mengerjakan sistem back-end',
          durasi: 30,
          target: 100,
          satuanTarget: 'persen',
        },
        {
          pekerjaan: 'melakukan perawatan server',
          durasi: 30,
          target: 100,
          satuanTarget: 'persen',
        },
        {
          pekerjaan: 'membuat rencana anggaran tahunan',
          durasi: 30,
          target: 2,
          satuanTarget: 'dokumen',
        },
        {
          pekerjaan: 'membuat rencana anggaran bulanan',
          durasi: 10,
          target: 1,
          satuanTarget: 'dokumen',
        },
      ]
    });
  } catch (error) {
    console.log(error);
  }
})();