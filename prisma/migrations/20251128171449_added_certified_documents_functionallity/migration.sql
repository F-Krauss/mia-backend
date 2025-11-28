-- AlterTable
ALTER TABLE "CertificationDocument" ADD COLUMN     "certificationDocument" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fileBase64" TEXT,
ADD COLUMN     "fileName" TEXT;
