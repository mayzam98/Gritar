async function testCorsProxy() {
  const url = `https://corsproxy.io/?url=${encodeURIComponent('https://www.youtube.com/watch?v=yOOOvy7JqrY')}`;
  try {
    const res = await fetch(url);
    const html = await res.text();
    const captionsMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
    if (!captionsMatch) {
      console.log("No captions found via proxy");
      return;
    }
    const tracks = JSON.parse(captionsMatch[1]);
    console.log("Tracks:", tracks.map(t => t.languageCode));
    
    const track = tracks.find(t => t.languageCode === 'es') || tracks[0];
    const xmlUrl = `https://corsproxy.io/?url=${encodeURIComponent(track.baseUrl)}`;
    const xmlRes = await fetch(xmlUrl);
    const xml = await xmlRes.text();
    console.log("XML starts with:", xml.substring(0, 100));
  } catch(e) {
    console.error(e);
  }
}
testCorsProxy();
