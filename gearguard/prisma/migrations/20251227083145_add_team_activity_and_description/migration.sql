-- AlterTable
ALTER TABLE "MaintenanceRequest" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "TeamActivity" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamActivity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TeamActivity" ADD CONSTRAINT "TeamActivity_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "MaintenanceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamActivity" ADD CONSTRAINT "TeamActivity_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "MaintenanceTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
