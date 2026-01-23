/*
  Warnings:

  - You are about to drop the column `code` on the `Building` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `Department` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `Resource` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Resource_code_key";

-- AlterTable
ALTER TABLE "Building" DROP COLUMN "code";

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "code";

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "code";
