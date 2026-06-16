const url = 'https://www.youtube.com/watch?v=QoFDGSYR1fc';

async function test() {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await res.text();
    const splitHtml = html.split('"captions":');
    const captionsJsonStr = splitHtml[1].split(',"videoDetails"')[0];
    const captionsObj = JSON.parse(`{"captions":${captionsJsonStr}}`);
    const tracks = captionsObj.captions.playerCaptionsTracklistRenderer.captionTracks;
    
    const trackUrl = tracks[0].baseUrl;
    console.log("Track URL:", trackUrl.substring(0, 80) + "...");
    
    const xmlRes = await fetch(trackUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    const xmlData = await xmlRes.text();
    console.log('XML length:', xmlData.length);
    console.log(xmlData.substring(0, 300));
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
