import puppeteer from 'puppeteer';

async function testPuppeteerXML() {
  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto('https://www.youtube.com/watch?v=qkBjCjvX64o', { waitUntil: 'domcontentloaded' });
    const html = await page.content();
    const match = html.match(/"captionTracks":\s*(\[.*?\])/);
    if (!match) return console.log("No match");
    const tracks = JSON.parse(match[1]);
    const track = tracks.find(t => t.languageCode === 'es');
    console.log("BaseUrl:", track.baseUrl);
    const res = await fetch(track.baseUrl);
    const xml = await res.text();
    console.log("XML starts with:", xml.substring(0, 200));
    
    const textMatches = [...xml.matchAll(/<text start="([^"]+)" dur="([^"]+)"[^>]*>([^<]+)<\/text>/g)];
    const text = textMatches.map(m => `[${Math.floor(parseFloat(m[1]))}] ${m[3].replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')}`).join('\n');
    console.log("Parsed:", text.substring(0, 200));
  } finally {
    await browser.close();
  }
}
testPuppeteerXML();
