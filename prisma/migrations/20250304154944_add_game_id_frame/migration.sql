/*
  Warnings:

  - Added the required column `gameId` to the `Frame` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Frame" ADD COLUMN     "gameId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Frame" ADD CONSTRAINT "Frame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
