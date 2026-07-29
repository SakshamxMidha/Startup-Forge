import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function generatePitchDeckPdf(html: string, filename: string): Promise<string> {
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch();
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'load' });

  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

  await browser.close();

  const uploadResult = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { resource_type: 'raw', public_id: filename.replace('.pdf', ''), folder: 'pitch-decks' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      )
      .end(pdfBuffer);
  });

  return uploadResult.secure_url;
}