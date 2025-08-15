/*
  Warnings:

  - Added the required column `realm` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "realm" TEXT NOT NULL;
