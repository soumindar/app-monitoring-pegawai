/*
  Warnings:

  - You are about to drop the column `token` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `Pegawai` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "token";

-- AlterTable
ALTER TABLE "Pegawai" DROP COLUMN "token";
