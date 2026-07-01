import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  console.log("Navigating...");
  await page.goto('https://www.youtube.com/watch?v=rlBVNjLNsuI', { waitUntil: 'domcontentloaded', timeout: 30000 });
  const html = await page.content();
  fs.writeFileSync('output.html', html);
  
  const match = html.match(/"captionTracks":\s*(\[.*?\])/);
  if (!match) {
    console.log("No captionTracks found");
    const consent = html.includes('consent.youtube.com');
    console.log("Consent screen?", consent);
  } else {
    console.log("Found captionTracks");
  }
  
  await browser.close();
})();
