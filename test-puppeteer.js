import puppeteer from 'puppeteer';

async function testPuppeteer() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Set headers to look like a real browser
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  let transcriptUrl = null;
  
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('timedtext') && url.includes('json3')) {
      transcriptUrl = url;
    }
  });

  try {
    console.log("Navigating...");
    await page.goto('https://www.youtube.com/watch?v=qkBjCjvX64o', { waitUntil: 'networkidle2' });
    
    if (transcriptUrl) {
      console.log("Found transcript URL:", transcriptUrl);
      const res = await fetch(transcriptUrl);
      const data = await res.json();
      console.log("Length:", data.events.length);
    } else {
      console.log("No transcript URL intercepted");
      // Fallback: look in the HTML for ytInitialPlayerResponse
      const html = await page.content();
      const match = html.match(/"captionTracks":\s*(\[.*?\])/);
      if (match) {
        console.log("Found in HTML!");
        const tracks = JSON.parse(match[1]);
        console.log("Tracks:", tracks.map(t => t.languageCode));
      } else {
        console.log("Not found in HTML either.");
      }
    }
  } catch(e) {
    console.error(e);
  } finally {
    await browser.close();
  }
}
testPuppeteer();
