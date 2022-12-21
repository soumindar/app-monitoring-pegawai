/*
  Warnings:

  - Made the column `keterangan` on table `Divisi` required. This step will fail if there are existing NULL values in that column.
  - Made the column `keterangan` on table `Jabatan` required. This step will fail if there are existing NULL values in that column.
  - Made the column `idDivisi` on table `Pegawai` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `idLevel` to the `Pekerjaan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AktivitasPegawai" ALTER COLUMN "realisasi" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Divisi" ALTER COLUMN "keterangan" SET NOT NULL;

-- AlterTable
ALTER TABLE "Jabatan" ALTER COLUMN "keterangan" SET NOT NULL;

-- AlterTable
ALTER TABLE "Pegawai" ALTER COLUMN "idDivisi" SET NOT NULL;

-- AlterTable
ALTER TABLE "Pekerjaan" ADD COLUMN     "idLevel" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Level" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "pengali" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deleted" TIMESTAMP(3),

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Pegawai" ADD CONSTRAINT "Pegawai_idDivisi_fkey" FOREIGN KEY ("idDivisi") REFERENCES "Divisi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pekerjaan" ADD CONSTRAINT "Pekerjaan_idLevel_fkey" FOREIGN KEY ("idLevel") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
