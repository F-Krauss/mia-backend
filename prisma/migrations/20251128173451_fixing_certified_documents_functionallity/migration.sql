/*
  Warnings:

  - You are about to drop the column `certificationDocument` on the `CertificationDocument` table. All the data in the column will be lost.
  - You are about to drop the column `fileBase64` on the `CertificationDocument` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `CertificationDocument` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CertificationDocument" DROP COLUMN "certificationDocument",
DROP COLUMN "fileBase64",
DROP COLUMN "fileName";
