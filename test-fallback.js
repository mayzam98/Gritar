async function fetchTranscriptFallback(videoId) {
  const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
  const html = await response.text();
  const captionsRegex = /"captionTracks":\[(.*?)\]/;
  const match = html.match(captionsRegex);
  if (match) {
    const tracks = JSON.parse(`[${match[1]}]`);
    console.log("Tracks found:", tracks.map(t => t.languageCode));
    const track = tracks.find(t => t.languageCode === 'es') || tracks[0];
    console.log("Base URL:", track.baseUrl);
    const xmlResponse = await fetch(track.baseUrl);
    const xmlText = await xmlResponse.text();
    console.log("XML:", xmlText.slice(0, 100));
  } else {
    console.log("No caption tracks found in HTML");
  }
}
fetchTranscriptFallback('yOOOvy7JqrY');
