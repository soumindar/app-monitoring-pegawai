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
        { jabatan: 'Direktur', keterangan: '-' },
        { jabatan: 'Manajer', keterangan: '-' },
        { jabatan: 'Sekretaris', keterangan: '-' },
        { jabatan: 'Bendahara', keterangan: '-' },
        { jabatan: 'Pegawai', keterangan: '-' }
      ]
    });

    await prisma.divisi.createMany({
      data: [
        { divisi: 'Marketing', keterangan: '-' },
        { divisi: 'IT', keterangan: '-' },
        { divisi: 'Keuangan', keterangan: '-' },
        { divisi: 'HRD', keterangan: '-' },
        { divisi: 'Umum', keterangan: '-' },
        { divisi: '-', keterangan: '-' }
      ]
    });

    const pegawai = await prisma.jabatan.findFirst({
      select: { id: true },
      where: { jabatan: 'Pegawai' },
    });
    const it = await prisma.divisi.findFirst({
      select: { id: true },
      where: { divisi: 'IT' },
    });
    
    const tglLahir = new Date('1999-12-27');
    const password2 = 'soumindar123'
    const hashedPassword2 = await bcrypt.hash(password2, salt);
    await prisma.pegawai.create({
      data: {
        nip: '272727',
        nama: 'Soumindar Qolby',
        tglLahir,
        idJabatan: pegawai.id,
        idDivisi: it.id,
        username: 'soumindar',
        password: hashedPassword2,
      }
    });

    await prisma.level.createMany({
      data: [
        { level: 'Low', pengali: 1 },
        { level: 'Medium', pengali: 1.2 },
        { level: 'High', pengali: 1.5 }
      ]
    });

    const low = await prisma.level.findFirst({
      select: { id: true },
      where: { level: 'Low' }
    });
    const medium = await prisma.level.findFirst({
      select: { id: true },
      where: { level: 'Medium' }
    });
    const high = await prisma.level.findFirst({
      select: { id: true },
      where: { level: 'High' }
    });

    await prisma.pekerjaan.createMany({
      data: [
        {
          pekerjaan: 'Membuat poster pemasaran produk',
          durasi: 30,
          target: 4,
          satuanTarget: 'Buah',
          idLevel: low.id,
        },
        {
          pekerjaan: 'Membuat video pendek pemasaran produk',
          durasi: 30,
          target: 4,
          satuanTarget: 'Buah',
          idLevel: low.id,
        },
        {
          pekerjaan: 'Mengelola sosial media perusahaan',
          durasi: 120,
          target: 100,
          satuanTarget: 'Persen',
          idLevel: medium.id,
        },
        {
          pekerjaan: 'Membuat rencana dan strategi pemasaran',
          durasi: 120,
          target: 1,
          satuanTarget: 'Dokumen',
          idLevel: high.id,
        },
        {
          pekerjaan: 'Membuat analisis sistem',
          durasi: 21,
          target: 1,
          satuanTarget: 'dokumen',
          idLevel: medium.id,
        },
        {
          pekerjaan: 'Mengerjakan sistem front-end',
          durasi: 90,
          target: 100,
          satuanTarget: 'persen',
          idLevel: high.id,
        },
        {
          pekerjaan: 'mengerjakan sistem back-end',
          durasi: 90,
          target: 100,
          satuanTarget: 'persen',
          idLevel: high.id,
        },
        {
          pekerjaan: 'melakukan perawatan server',
          durasi: 30,
          target: 100,
          satuanTarget: 'persen',
          idLevel: low.id,
        },
        {
          pekerjaan: 'Membuat rencana anggaran tahunan',
          durasi: 30,
          target: 2,
          satuanTarget: 'dokumen',
          idLevel: high.id,
        },
        {
          pekerjaan: 'membuat laporan keuangan semesteran',
          durasi: 15,
          target: 1,
          satuanTarget: 'dokumen',
          idLevel: low.id,
        },
        {
          pekerjaan: 'Mengelola keuangan perusahaan',
          durasi: 365,
          target: 100,
          satuanTarget: 'persen',
          idLevel: medium.id,
        },
        {
          pekerjaan: 'Melakukan dokumentasi pemasukan dan pengeluaran perusahaan',
          durasi: 180,
          target: 100,
          satuanTarget: 'persen',
          idLevel: medium.id,
        },
        {
          pekerjaan: 'Melakukan rekrutmen pegawai',
          durasi: 90,
          target: 100,
          satuanTarget: 'persen',
          idLevel: medium.id,
        },
        {
          pekerjaan: 'Memonitoring kinerja pegawai',
          durasi: 365,
          target: 100,
          satuanTarget: 'persen',
          idLevel: high.id,
        },
        {
          pekerjaan: 'Membuat surat izin cuti pegawai',
          durasi: 365,
          target: 100,
          satuanTarget: 'persen',
          idLevel: low.id,
        },
        {
          pekerjaan: 'Mengadakan acara pelatihan untuk pegawai',
          durasi: 90,
          target: 2,
          satuanTarget: 'acara',
          idLevel: medium.id,
        },
        {
          pekerjaan: 'Menyediakan dan mengelola fasilitas perusahaan',
          durasi: 180,
          target: 100,
          satuanTarget: 'persen',
          idLevel: medium.id,
        },
        {
          pekerjaan: 'Menjaga kebersihan dan keamanan kantor',
          durasi: 90,
          target: 100,
          satuanTarget: 'persen',
          idLevel: low.id,
        },
        {
          pekerjaan: 'Membuat surat perusahaan',
          durasi: 365,
          target: 100,
          satuanTarget: 'persen',
          idLevel: medium.id,
        },
        {
          pekerjaan: 'Mengelola dokumen perusahaan',
          durasi: 365,
          target: 100,
          satuanTarget: 'persen',
          idLevel: high.id,
        },
        {
          pekerjaan: 'Memimpin divisi dalam perusahaan',
          durasi: 365,
          target: 100,
          satuanTarget: 'persen',
          idLevel: high.id,
        },
        {
          pekerjaan: 'Menentukan langkah strategis perusahaan',
          durasi: 365,
          target: 100,
          satuanTarget: 'persen',
          idLevel: high.id,
        }
      ]
    });
  } catch (error) {
    console.log(error);
  }
})();