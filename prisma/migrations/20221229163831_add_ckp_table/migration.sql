-- AlterTable
ALTER TABLE "AktivitasPegawai" ALTER COLUMN "realisasi" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Pekerjaan" ALTER COLUMN "target" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "ckpTahunanPegawai" (
    "id" TEXT NOT NULL,
    "idPegawai" TEXT NOT NULL,
    "ckp" DOUBLE PRECISION NOT NULL,
    "tahun" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" TIMESTAMP(3),

    CONSTRAINT "ckpTahunanPegawai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ckpBulananPegawai" (
    "id" TEXT NOT NULL,
    "idPegawai" TEXT NOT NULL,
    "ckp" DOUBLE PRECISION NOT NULL,
    "bulan" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" TIMESTAMP(3),

    CONSTRAINT "ckpBulananPegawai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ckpTahunanDivisi" (
    "id" TEXT NOT NULL,
    "idDivisi" TEXT NOT NULL,
    "ckp" DOUBLE PRECISION NOT NULL,
    "tahun" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" TIMESTAMP(3),

    CONSTRAINT "ckpTahunanDivisi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ckpBulananDivisi" (
    "id" TEXT NOT NULL,
    "idDivisi" TEXT NOT NULL,
    "ckp" DOUBLE PRECISION NOT NULL,
    "bulan" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" TIMESTAMP(3),

    CONSTRAINT "ckpBulananDivisi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ckpTahunanKeseluruhan" (
    "id" TEXT NOT NULL,
    "ckp" DOUBLE PRECISION NOT NULL,
    "tahun" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" TIMESTAMP(3),

    CONSTRAINT "ckpTahunanKeseluruhan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ckpBulananKeseluruhan" (
    "id" TEXT NOT NULL,
    "ckp" DOUBLE PRECISION NOT NULL,
    "bulan" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" TIMESTAMP(3),

    CONSTRAINT "ckpBulananKeseluruhan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ckpTahunanPegawai" ADD CONSTRAINT "ckpTahunanPegawai_idPegawai_fkey" FOREIGN KEY ("idPegawai") REFERENCES "Pegawai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ckpBulananPegawai" ADD CONSTRAINT "ckpBulananPegawai_idPegawai_fkey" FOREIGN KEY ("idPegawai") REFERENCES "Pegawai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ckpTahunanDivisi" ADD CONSTRAINT "ckpTahunanDivisi_idDivisi_fkey" FOREIGN KEY ("idDivisi") REFERENCES "Divisi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ckpBulananDivisi" ADD CONSTRAINT "ckpBulananDivisi_idDivisi_fkey" FOREIGN KEY ("idDivisi") REFERENCES "Divisi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
