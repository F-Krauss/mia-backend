-- DropForeignKey
ALTER TABLE "Machine" DROP CONSTRAINT "Machine_processId_fkey";

-- DropForeignKey
ALTER TABLE "Machine" DROP CONSTRAINT "Machine_subprocessId_fkey";

-- DropForeignKey
ALTER TABLE "MachineDocument" DROP CONSTRAINT "MachineDocument_machineId_fkey";

-- DropForeignKey
ALTER TABLE "Process" DROP CONSTRAINT "Process_plantId_fkey";

-- DropForeignKey
ALTER TABLE "Subprocess" DROP CONSTRAINT "Subprocess_processId_fkey";

-- AddForeignKey
ALTER TABLE "Process" ADD CONSTRAINT "Process_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subprocess" ADD CONSTRAINT "Subprocess_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_subprocessId_fkey" FOREIGN KEY ("subprocessId") REFERENCES "Subprocess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineDocument" ADD CONSTRAINT "MachineDocument_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
