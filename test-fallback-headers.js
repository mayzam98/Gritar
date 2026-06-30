async function fetchTranscriptCustom(videoUrl) {
  const response = await fetch(videoUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept-Language': 'en-US,en;q=0.9,es;q=0.8'
    }
  });
  const html = await response.text();
  const captionsMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
  if (!captionsMatch) throw new Error('No caption tracks found');
  const tracks = JSON.parse(captionsMatch[1]);
  const track = tracks.find(t => t.languageCode.startsWith('es')) || tracks[0];
  
  console.log("Track URL:", track.baseUrl);
  const xmlResponse = await fetch(track.baseUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept-Language': 'en-US,en;q=0.9,es;q=0.8'
    }
  });
  const xml = await xmlResponse.text();
  console.log("XML Length:", xml.length);
  console.log("XML:", xml.substring(0, 100));
}
fetchTranscriptCustom('https://www.youtube.com/watch?v=yOOOvy7JqrY');
