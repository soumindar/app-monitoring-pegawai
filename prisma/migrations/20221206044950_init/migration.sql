/*
  Warnings:

  - You are about to drop the `PekerjaanPegawai` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PekerjaanPegawai" DROP CONSTRAINT "PekerjaanPegawai_idPegawai_fkey";

-- DropForeignKey
ALTER TABLE "PekerjaanPegawai" DROP CONSTRAINT "PekerjaanPegawai_idPekerjaan_fkey";

-- DropTable
DROP TABLE "PekerjaanPegawai";

-- CreateTable
CREATE TABLE "AktivitasPegawai" (
    "idPegawai" TEXT NOT NULL,
    "idPekerjaan" TEXT NOT NULL,
    "tglMulai" DATE NOT NULL,
    "tglSelesai" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" TIMESTAMP(3),

    CONSTRAINT "AktivitasPegawai_pkey" PRIMARY KEY ("idPegawai","idPekerjaan")
);

-- AddForeignKey
ALTER TABLE "AktivitasPegawai" ADD CONSTRAINT "AktivitasPegawai_idPegawai_fkey" FOREIGN KEY ("idPegawai") REFERENCES "Pegawai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AktivitasPegawai" ADD CONSTRAINT "AktivitasPegawai_idPekerjaan_fkey" FOREIGN KEY ("idPekerjaan") REFERENCES "Pekerjaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
