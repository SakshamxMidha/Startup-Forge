/*
  Warnings:

  - You are about to drop the column `description` on the `Startup` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Startup` table. All the data in the column will be lost.
  - Added the required column `rawIdea` to the `Startup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Startup` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SwotCategory" AS ENUM ('STRENGTH', 'WEAKNESS', 'OPPORTUNITY', 'THREAT');

-- AlterTable
ALTER TABLE "Startup" DROP COLUMN "description",
DROP COLUMN "name",
ADD COLUMN     "rawIdea" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "marketScore" DOUBLE PRECISION NOT NULL,
    "difficultyScore" DOUBLE PRECISION NOT NULL,
    "revenueScore" DOUBLE PRECISION NOT NULL,
    "competitionLevel" TEXT NOT NULL,
    "timeToBuildWeeks" INTEGER NOT NULL,
    "recommendation" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessPlan" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "mission" TEXT NOT NULL,
    "vision" TEXT NOT NULL,
    "usp" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "businessModel" TEXT NOT NULL,
    "growthStrategy" TEXT[],

    CONSTRAINT "BusinessPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Persona" (
    "id" TEXT NOT NULL,
    "businessPlanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ageRange" TEXT NOT NULL,
    "behavior" TEXT NOT NULL,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PainPoint" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "PainPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwotItem" (
    "id" TEXT NOT NULL,
    "businessPlanId" TEXT NOT NULL,
    "category" "SwotCategory" NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "SwotItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueStream" (
    "id" TEXT NOT NULL,
    "businessPlanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pricing" TEXT NOT NULL,

    CONSTRAINT "RevenueStream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketReport" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "trendDirection" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "cachedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketKeyword" (
    "id" TEXT NOT NULL,
    "marketReportId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,

    CONSTRAINT "MarketKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedditSignal" (
    "id" TEXT NOT NULL,
    "marketReportId" TEXT NOT NULL,
    "subreddit" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "RedditSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HnSignal" (
    "id" TEXT NOT NULL,
    "marketReportId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "HnSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorMessage" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentorMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemaDesign" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "entitiesJson" JSONB NOT NULL,
    "relationsJson" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchemaDesign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PitchDeck" (
    "id" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PitchDeck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_startupId_key" ON "Analysis"("startupId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPlan_startupId_key" ON "BusinessPlan"("startupId");

-- CreateIndex
CREATE UNIQUE INDEX "Persona_businessPlanId_key" ON "Persona"("businessPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketReport_startupId_key" ON "MarketReport"("startupId");

-- CreateIndex
CREATE UNIQUE INDEX "SchemaDesign_startupId_key" ON "SchemaDesign"("startupId");

-- CreateIndex
CREATE UNIQUE INDEX "PitchDeck_startupId_key" ON "PitchDeck"("startupId");

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPlan" ADD CONSTRAINT "BusinessPlan_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Persona" ADD CONSTRAINT "Persona_businessPlanId_fkey" FOREIGN KEY ("businessPlanId") REFERENCES "BusinessPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainPoint" ADD CONSTRAINT "PainPoint_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwotItem" ADD CONSTRAINT "SwotItem_businessPlanId_fkey" FOREIGN KEY ("businessPlanId") REFERENCES "BusinessPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueStream" ADD CONSTRAINT "RevenueStream_businessPlanId_fkey" FOREIGN KEY ("businessPlanId") REFERENCES "BusinessPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketReport" ADD CONSTRAINT "MarketReport_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketKeyword" ADD CONSTRAINT "MarketKeyword_marketReportId_fkey" FOREIGN KEY ("marketReportId") REFERENCES "MarketReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedditSignal" ADD CONSTRAINT "RedditSignal_marketReportId_fkey" FOREIGN KEY ("marketReportId") REFERENCES "MarketReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HnSignal" ADD CONSTRAINT "HnSignal_marketReportId_fkey" FOREIGN KEY ("marketReportId") REFERENCES "MarketReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorMessage" ADD CONSTRAINT "MentorMessage_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemaDesign" ADD CONSTRAINT "SchemaDesign_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PitchDeck" ADD CONSTRAINT "PitchDeck_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
