/*
  Warnings:

  - A unique constraint covering the columns `[bulan]` on the table `ckpBulananDivisi` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bulan]` on the table `ckpBulananKeseluruhan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bulan]` on the table `ckpBulananPegawai` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tahun]` on the table `ckpTahunanDivisi` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tahun]` on the table `ckpTahunanKeseluruhan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tahun]` on the table `ckpTahunanPegawai` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ckpBulananDivisi_bulan_key" ON "ckpBulananDivisi"("bulan");

-- CreateIndex
CREATE UNIQUE INDEX "ckpBulananKeseluruhan_bulan_key" ON "ckpBulananKeseluruhan"("bulan");

-- CreateIndex
CREATE UNIQUE INDEX "ckpBulananPegawai_bulan_key" ON "ckpBulananPegawai"("bulan");

-- CreateIndex
CREATE UNIQUE INDEX "ckpTahunanDivisi_tahun_key" ON "ckpTahunanDivisi"("tahun");

-- CreateIndex
CREATE UNIQUE INDEX "ckpTahunanKeseluruhan_tahun_key" ON "ckpTahunanKeseluruhan"("tahun");

-- CreateIndex
CREATE UNIQUE INDEX "ckpTahunanPegawai_tahun_key" ON "ckpTahunanPegawai"("tahun");
