/*
  Warnings:

  - You are about to drop the column `realisasi` on the `Pekerjaan` table. All the data in the column will be lost.
  - Added the required column `realisasi` to the `AktivitasPegawai` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Pegawai" DROP CONSTRAINT "Pegawai_idDivisi_fkey";

-- AlterTable
ALTER TABLE "AktivitasPegawai" ADD COLUMN     "realisasi" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Pegawai" ALTER COLUMN "idDivisi" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Pekerjaan" DROP COLUMN "realisasi";
