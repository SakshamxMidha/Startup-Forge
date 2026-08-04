-- Replace pdfUrl (Cloudinary URL from the removed Puppeteer generator) with structured
-- slide content, rendered client-side. Existing PitchDeck rows point at a format the
-- new frontend can no longer render, so they're cleared rather than backfilled.
DELETE FROM "PitchDeck";

ALTER TABLE "PitchDeck" DROP COLUMN "pdfUrl";
ALTER TABLE "PitchDeck" ADD COLUMN "content" JSONB NOT NULL;
