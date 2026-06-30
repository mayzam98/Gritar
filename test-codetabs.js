async function testCodetabs() {
  const ytUrl = encodeURIComponent('https://www.youtube.com/watch?v=qkBjCjvX64o');
  const url = `https://api.codetabs.com/v1/proxy/?quest=${ytUrl}`;
  try {
    const res = await fetch(url);
    const html = await res.text();
    const captionsMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
    if (!captionsMatch) {
      console.log("No captions found via codetabs");
      return;
    }
    const tracks = JSON.parse(captionsMatch[1]);
    console.log("Tracks:", tracks.map(t => t.languageCode));
  } catch(e) {
    console.error(e);
  }
}
testCodetabs();
