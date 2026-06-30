async function testPiped() {
  const videoId = 'qkBjCjvX64o';
  try {
    const res = await fetch(`https://pipedapi.kavin.rocks/streams/${videoId}`);
    const data = await res.json();
    if (data && data.subtitles && data.subtitles.length > 0) {
      console.log("Found subtitles:", data.subtitles.map(s => s.code));
      const esSub = data.subtitles.find(s => s.code === 'es') || data.subtitles[0];
      const subRes = await fetch(esSub.url);
      const subText = await subRes.text();
      console.log("Content starts with:", subText.substring(0, 200));
    } else {
      console.log("No subtitles found in Piped API");
    }
  } catch(e) {
    console.error("Error:", e);
  }
}
testPiped();
