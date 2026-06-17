/*
  Warnings:

  - You are about to drop the column `input` on the `AIHistory` table. All the data in the column will be lost.
  - You are about to drop the column `output` on the `AIHistory` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Patient` table. All the data in the column will be lost.
  - Added the required column `context` to the `AIHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `query` to the `AIHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `response` to the `AIHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `condition` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AIHistory" DROP COLUMN "input",
DROP COLUMN "output",
ADD COLUMN     "context" TEXT NOT NULL,
ADD COLUMN     "query" TEXT NOT NULL,
ADD COLUMN     "response" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "userId",
ADD COLUMN     "condition" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "status" TEXT DEFAULT 'active',
ALTER COLUMN "gender" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);
