-- DropForeignKey
ALTER TABLE "BookingApproval" DROP CONSTRAINT "BookingApproval_approverId_fkey";

-- AlterTable
ALTER TABLE "BookingApproval" ALTER COLUMN "approverId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "BookingApproval" ADD CONSTRAINT "BookingApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
