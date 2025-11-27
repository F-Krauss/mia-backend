-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('unassigned', 'assigned', 'in_progress', 'on_hold', 'testing', 'closed', 'cancelled');

-- CreateEnum
CREATE TYPE "WorkOrderPriority" AS ENUM ('P1', 'P2', 'P3');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('Bajo', 'Medio', 'Alto');

-- CreateEnum
CREATE TYPE "AiMatch" AS ENUM ('yes', 'no');

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL,
    "otNumber" TEXT NOT NULL,
    "plantId" TEXT,
    "processId" TEXT,
    "subprocessId" TEXT,
    "machineId" TEXT,
    "plantName" TEXT NOT NULL,
    "processName" TEXT NOT NULL,
    "subprocessName" TEXT NOT NULL,
    "machineCode" TEXT NOT NULL,
    "machineName" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "detectorName" TEXT NOT NULL,
    "shift" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "machineStatus" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "symptoms" TEXT[],
    "status" "WorkOrderStatus" NOT NULL,
    "assignedTo" TEXT,
    "slaTarget" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrderAIData" (
    "id" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "priority" "WorkOrderPriority" NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "productionImpact" TEXT NOT NULL,
    "qualityImpact" BOOLEAN NOT NULL,
    "operatorInstructions" TEXT NOT NULL,
    "rootCauses" JSONB NOT NULL,
    "suggestedActions" TEXT[],
    "workOrderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrderAIData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicalReport" (
    "id" TEXT NOT NULL,
    "inspections" TEXT,
    "measurements" TEXT,
    "diagnosis" TEXT,
    "aiMatch" "AiMatch",
    "rootCause" TEXT,
    "actions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "otherActionDetail" TEXT,
    "supplies" TEXT,
    "preventiveMeasures" TEXT,
    "workOrderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnicalReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrderLog" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "action" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "comment" TEXT,
    "workOrderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkOrderLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrder_otNumber_key" ON "WorkOrder"("otNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrderAIData_workOrderId_key" ON "WorkOrderAIData"("workOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "TechnicalReport_workOrderId_key" ON "TechnicalReport"("workOrderId");

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_subprocessId_fkey" FOREIGN KEY ("subprocessId") REFERENCES "Subprocess"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderAIData" ADD CONSTRAINT "WorkOrderAIData_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalReport" ADD CONSTRAINT "TechnicalReport_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderLog" ADD CONSTRAINT "WorkOrderLog_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
