/*
  Warnings:

  - You are about to drop the column `location` on the `Game` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Frame" ALTER COLUMN "roll_one" SET DATA TYPE TEXT,
ALTER COLUMN "roll_two" SET DATA TYPE TEXT,
ALTER COLUMN "roll_three" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "location";
