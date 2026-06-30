async function testPiped() {
  const url = 'https://pipedapi.kavin.rocks/streams/yOOOvy7JqrY';
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Subtitles:", data.subtitles);
    if (data.subtitles && data.subtitles.length > 0) {
      const esSub = data.subtitles.find(s => s.code === 'es') || data.subtitles[0];
      console.log("Found sub:", esSub.url);
      const subRes = await fetch(esSub.url);
      const subText = await subRes.text();
      console.log("Sub content starts with:", subText.substring(0, 100));
    }
  } catch (e) {
    console.error(e);
  }
}
testPiped();
