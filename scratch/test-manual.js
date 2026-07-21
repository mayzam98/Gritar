async function test() {
  const videoUrl = 'https://www.youtube.com/watch?v=yOOOvy7JqrY';
  try {
      const response = await fetch(videoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cookie': 'CONSENT=YES+cb'
        }
      });
      const html = await response.text();
      const splittedHTML = html.split('"captions":');
      if (splittedHTML.length > 1) {
        const captionsJson = splittedHTML[1].split(',"videoDetails')[0];
        const captions = JSON.parse(captionsJson);
        console.log(captions.playerCaptionsTracklistRenderer.captionTracks[0].baseUrl);
      } else {
        console.log('No captions found in HTML');
      }
  } catch (e) {
      console.log('Error:', e.message);
  }
}
test();
