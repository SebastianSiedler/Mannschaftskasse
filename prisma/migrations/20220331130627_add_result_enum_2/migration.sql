/*
  Warnings:

  - Added the required column `resultType` to the `Spiel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Spiel" ADD COLUMN     "resultType" "Result" NOT NULL;
