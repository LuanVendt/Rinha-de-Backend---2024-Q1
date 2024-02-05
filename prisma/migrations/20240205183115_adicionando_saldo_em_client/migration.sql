/*
  Warnings:

  - Added the required column `saldo` to the `client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "client" ADD COLUMN     "saldo" INTEGER NOT NULL;
