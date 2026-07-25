import fs from 'fs';
import path from 'path';

export async function generatePitchDeckPdf(html: string, filename: string): Promise<string> {
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch();
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'load' });

  const outputDir = path.join(process.cwd(), 'generated-pdfs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, filename);
  await page.pdf({ path: filePath, format: 'A4', printBackground: true });

  await browser.close();

  return filename;
}