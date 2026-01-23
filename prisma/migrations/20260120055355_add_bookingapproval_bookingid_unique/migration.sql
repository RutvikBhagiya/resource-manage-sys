/*
  Warnings:

  - A unique constraint covering the columns `[bookingId]` on the table `BookingApproval` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BookingApproval_bookingId_key" ON "BookingApproval"("bookingId");
