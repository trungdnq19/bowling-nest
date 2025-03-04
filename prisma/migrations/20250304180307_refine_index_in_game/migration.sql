/*
  Warnings:

  - You are about to drop the column `roll_one` on the `Frame` table. All the data in the column will be lost.
  - You are about to drop the column `roll_three` on the `Frame` table. All the data in the column will be lost.
  - You are about to drop the column `roll_two` on the `Frame` table. All the data in the column will be lost.
  - You are about to drop the column `currentFrame` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `currentPlayer` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `currentRoll` on the `Game` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Frame" DROP COLUMN "roll_one",
DROP COLUMN "roll_three",
DROP COLUMN "roll_two",
ADD COLUMN     "rolls" TEXT[];

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "currentFrame",
DROP COLUMN "currentPlayer",
DROP COLUMN "currentRoll",
ADD COLUMN     "currentFrameIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currentPlayerIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currentRollIndex" INTEGER NOT NULL DEFAULT 0;
