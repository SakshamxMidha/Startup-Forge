import { PitchDeckContentResult } from "./generatePitchDeckContent";

function slideHtml(
  title: string,
  bullets: string[],
  slideNumber: number,
): string {
  const bulletItems = bullets
    .map((b) => `<li><span class="check">✓</span>${b}</li>`)
    .join("");
  return `
    <div class="slide">
      <div class="slide-number">${slideNumber}</div>
      <div class="accent-bar"></div>
      <h2>${title}</h2>
      <ul>${bulletItems}</ul>
    </div>
  `;
}

export function renderPitchDeckHtml(content: PitchDeckContentResult): string {
  const slides = [
    slideHtml(content.problemSlide.title, content.problemSlide.bullets, 2),
    slideHtml(content.solutionSlide.title, content.solutionSlide.bullets, 3),
    slideHtml(content.marketSlide.title, content.marketSlide.bullets, 4),
    slideHtml(
      content.businessModelSlide.title,
      content.businessModelSlide.bullets,
      5,
    ),
    slideHtml(
      content.competitionSlide.title,
      content.competitionSlide.bullets,
      6,
    ),
    slideHtml(content.askSlide.title, content.askSlide.bullets, 7),
  ].join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${content.companyName} - Pitch Deck</title>
        <style>
            @page { size: A4; margin: 0; }
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; color: #2d2d3a; }
            .slide { page-break-after: always; padding: 55px 65px; width: 210mm; height: 297mm; box-sizing: border-box; position: relative; overflow: hidden; }
            .cover { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: #1a1a2e; color: white; }
            .cover h1 { font-size: 50px; margin-bottom: 14px; font-weight: 700; }
            .cover p { font-size: 21px; color: #b4b4d4; max-width: 500px; }
            .accent-bar { width: 50px; height: 5px; background: #e94560; margin-bottom: 20px; border-radius: 3px; }
            h2 { font-size: 28px; color: #1a1a2e; margin: 0 0 35px 0; line-height: 1.3; font-weight: 700; }
            ul { list-style: none; margin: 0; padding: 0; }
            li { font-size: 18px; line-height: 1.6; margin-bottom: 22px; display: flex; align-items: flex-start; }
            .check { color: #e94560; font-weight: bold; margin-right: 14px; font-size: 18px; flex-shrink: 0; }
            .slide-number { position: absolute; bottom: 25px; right: 35px; color: #b0b0b0; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="slide cover">
          <h1>${content.companyName}</h1>
          <p>${content.tagline}</p>
        </div>
        ${slides}
      </body>
    </html>
  `;
}
