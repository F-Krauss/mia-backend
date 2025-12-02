-- CreateTable
CREATE TABLE "AIQuery" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "answerSummary" TEXT,
    "sources" JSONB,
    "userId" TEXT,
    "userName" TEXT,
    "plantId" TEXT,
    "processId" TEXT,
    "subprocessId" TEXT,
    "machineId" TEXT,
    "contextPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIQuery_pkey" PRIMARY KEY ("id")
);
