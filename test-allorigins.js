async function testAllOrigins() {
  const ytUrl = encodeURIComponent('https://www.youtube.com/watch?v=qkBjCjvX64o');
  const url = `https://api.allorigins.win/get?url=${ytUrl}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const html = data.contents;
    const captionsMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
    if (!captionsMatch) {
      console.log("No captions found via allorigins");
      return;
    }
    const tracks = JSON.parse(captionsMatch[1]);
    console.log("Tracks:", tracks.map(t => t.languageCode));
    
    const track = tracks.find(t => t.languageCode === 'es') || tracks[0];
    const xmlUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(track.baseUrl)}`;
    const xmlRes = await fetch(xmlUrl);
    const xmlData = await xmlRes.json();
    const xml = xmlData.contents;
    console.log("XML starts with:", xml.substring(0, 100));
  } catch(e) {
    console.error(e);
  }
}
testAllOrigins();
