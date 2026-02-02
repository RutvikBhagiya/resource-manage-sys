/*
  Warnings:

  - You are about to drop the column `headUserId` on the `Department` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditEntity" ADD VALUE 'BUILDING';
ALTER TYPE "AuditEntity" ADD VALUE 'RESOURCE_CATEGORY';
ALTER TYPE "AuditEntity" ADD VALUE 'RESOURCE_AMENITY';
ALTER TYPE "AuditEntity" ADD VALUE 'RESOURCE_AVAILABILITY';
ALTER TYPE "AuditEntity" ADD VALUE 'STORAGE_UNIT';
ALTER TYPE "AuditEntity" ADD VALUE 'COMPARTMENT';
ALTER TYPE "AuditEntity" ADD VALUE 'BOOKING_APPROVAL';
ALTER TYPE "AuditEntity" ADD VALUE 'NOTIFICATION';
ALTER TYPE "AuditEntity" ADD VALUE 'ACCOUNT';
ALTER TYPE "AuditEntity" ADD VALUE 'SESSION';

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "headUserId";
