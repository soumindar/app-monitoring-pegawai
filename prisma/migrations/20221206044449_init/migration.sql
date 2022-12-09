-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "token" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" TIMESTAMP(3),

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jabatan" (
    "id" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" TIMESTAMP(3),

    CONSTRAINT "Jabatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Divisi" (
    "id" TEXT NOT NULL,
    "divisi" TEXT NOT NULL,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" TIMESTAMP(3),

    CONSTRAINT "Divisi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pegawai" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "token" TEXT,
    "nip" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tglLahir" DATE NOT NULL,
    "idJabatan" TEXT NOT NULL,
    "idDivisi" TEXT NOT NULL,
    "foto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" TIMESTAMP(3),

    CONSTRAINT "Pegawai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pekerjaan" (
    "id" TEXT NOT NULL,
    "pekerjaan" TEXT NOT NULL,
    "durasi" INTEGER NOT NULL,
    "target" INTEGER NOT NULL,
    "satuanTarget" TEXT NOT NULL,
    "realisasi" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" TIMESTAMP(3),

    CONSTRAINT "Pekerjaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PekerjaanPegawai" (
    "idPegawai" TEXT NOT NULL,
    "idPekerjaan" TEXT NOT NULL,
    "tglMulai" DATE NOT NULL,
    "tglSelesai" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" TIMESTAMP(3),

    CONSTRAINT "PekerjaanPegawai_pkey" PRIMARY KEY ("idPegawai","idPekerjaan")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Pegawai_username_key" ON "Pegawai"("username");

-- AddForeignKey
ALTER TABLE "Pegawai" ADD CONSTRAINT "Pegawai_idJabatan_fkey" FOREIGN KEY ("idJabatan") REFERENCES "Jabatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pegawai" ADD CONSTRAINT "Pegawai_idDivisi_fkey" FOREIGN KEY ("idDivisi") REFERENCES "Divisi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PekerjaanPegawai" ADD CONSTRAINT "PekerjaanPegawai_idPegawai_fkey" FOREIGN KEY ("idPegawai") REFERENCES "Pegawai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PekerjaanPegawai" ADD CONSTRAINT "PekerjaanPegawai_idPekerjaan_fkey" FOREIGN KEY ("idPekerjaan") REFERENCES "Pekerjaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
