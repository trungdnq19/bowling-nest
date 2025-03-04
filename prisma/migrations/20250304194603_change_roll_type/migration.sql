/*
  Warnings:

  - The `rolls` column on the `Frame` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Frame" DROP COLUMN "rolls",
ADD COLUMN     "rolls" INTEGER[];
