-- CreateTable
CREATE TABLE "Procedure" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "reviewer" TEXT,
    "responsible" TEXT,
    "notifyEmail" BOOLEAN NOT NULL DEFAULT false,
    "notifyWhatsapp" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "processId" TEXT,
    "subprocessId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Procedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureDocument" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcedureDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureDocumentVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "fileUrl" TEXT,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "renewalDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'in_review',
    "updatedBy" TEXT,
    "documentId" TEXT NOT NULL,

    CONSTRAINT "ProcedureDocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProcedureDocument_procedureId_code_key" ON "ProcedureDocument"("procedureId", "code");

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_subprocessId_fkey" FOREIGN KEY ("subprocessId") REFERENCES "Subprocess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureDocument" ADD CONSTRAINT "ProcedureDocument_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureDocumentVersion" ADD CONSTRAINT "ProcedureDocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "ProcedureDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
