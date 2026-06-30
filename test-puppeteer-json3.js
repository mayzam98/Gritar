import puppeteer from 'puppeteer';

async function testPuppeteerXML() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
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
    
    // Fetch FROM INSIDE the browser to guarantee it works, adding fmt=json3
    const json = await page.evaluate(async (url) => {
      const r = await fetch(url + '&fmt=json3');
      return await r.json();
    }, track.baseUrl);
    
    console.log("Events:", json.events.length);
    const text = json.events.map(ev => {
      if (!ev.segs) return null;
      return `[${Math.floor(ev.tStartMs/1000)}] ` + ev.segs.map(s => s.utf8).join('');
    }).filter(Boolean).join('\n');
    
    console.log("Parsed:", text.substring(0, 200));
  } catch(e) {
    console.error(e);
  } finally {
    await browser.close();
  }
}
testPuppeteerXML();
