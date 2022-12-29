/*
  Warnings:

  - A unique constraint covering the columns `[idDivisi,bulan]` on the table `ckpBulananDivisi` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idPegawai,bulan]` on the table `ckpBulananPegawai` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idDivisi,tahun]` on the table `ckpTahunanDivisi` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idPegawai,tahun]` on the table `ckpTahunanPegawai` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ckpBulananDivisi_bulan_key";

-- DropIndex
DROP INDEX "ckpBulananPegawai_bulan_key";

-- DropIndex
DROP INDEX "ckpTahunanDivisi_tahun_key";

-- DropIndex
DROP INDEX "ckpTahunanPegawai_tahun_key";

-- CreateIndex
CREATE UNIQUE INDEX "ckpBulananDivisi_idDivisi_bulan_key" ON "ckpBulananDivisi"("idDivisi", "bulan");

-- CreateIndex
CREATE UNIQUE INDEX "ckpBulananPegawai_idPegawai_bulan_key" ON "ckpBulananPegawai"("idPegawai", "bulan");

-- CreateIndex
CREATE UNIQUE INDEX "ckpTahunanDivisi_idDivisi_tahun_key" ON "ckpTahunanDivisi"("idDivisi", "tahun");

-- CreateIndex
CREATE UNIQUE INDEX "ckpTahunanPegawai_idPegawai_tahun_key" ON "ckpTahunanPegawai"("idPegawai", "tahun");
