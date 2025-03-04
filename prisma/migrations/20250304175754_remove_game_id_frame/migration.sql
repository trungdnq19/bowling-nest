/*
  Warnings:

  - You are about to drop the column `gameId` on the `Frame` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Frame" DROP CONSTRAINT "Frame_gameId_fkey";

-- AlterTable
ALTER TABLE "Frame" DROP COLUMN "gameId";
