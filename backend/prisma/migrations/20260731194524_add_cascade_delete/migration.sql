-- DropForeignKey
ALTER TABLE "PainPoint" DROP CONSTRAINT "PainPoint_personaId_fkey";

-- DropForeignKey
ALTER TABLE "Persona" DROP CONSTRAINT "Persona_businessPlanId_fkey";

-- DropForeignKey
ALTER TABLE "RevenueStream" DROP CONSTRAINT "RevenueStream_businessPlanId_fkey";

-- DropForeignKey
ALTER TABLE "SwotItem" DROP CONSTRAINT "SwotItem_businessPlanId_fkey";

-- AddForeignKey
ALTER TABLE "Persona" ADD CONSTRAINT "Persona_businessPlanId_fkey" FOREIGN KEY ("businessPlanId") REFERENCES "BusinessPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainPoint" ADD CONSTRAINT "PainPoint_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwotItem" ADD CONSTRAINT "SwotItem_businessPlanId_fkey" FOREIGN KEY ("businessPlanId") REFERENCES "BusinessPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevenueStream" ADD CONSTRAINT "RevenueStream_businessPlanId_fkey" FOREIGN KEY ("businessPlanId") REFERENCES "BusinessPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
