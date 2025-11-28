-- CreateTable
CREATE TABLE "ControlledDocument" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "nextReview" TIMESTAMP(3),
    "owner" TEXT,
    "fileUrl" TEXT,
    "fileBase64" TEXT,
    "fileName" TEXT,
    "plantId" TEXT,
    "processId" TEXT,
    "subprocessId" TEXT,
    "machineId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ControlledDocument_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ControlledDocument" ADD CONSTRAINT "ControlledDocument_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlledDocument" ADD CONSTRAINT "ControlledDocument_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlledDocument" ADD CONSTRAINT "ControlledDocument_subprocessId_fkey" FOREIGN KEY ("subprocessId") REFERENCES "Subprocess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlledDocument" ADD CONSTRAINT "ControlledDocument_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
