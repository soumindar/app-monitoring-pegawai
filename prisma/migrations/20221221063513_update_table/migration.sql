/*
  Warnings:

  - Added the required column `idDivisi` to the `Pekerjaan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pekerjaan" ADD COLUMN     "idDivisi" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Pekerjaan" ADD CONSTRAINT "Pekerjaan_idDivisi_fkey" FOREIGN KEY ("idDivisi") REFERENCES "Divisi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
