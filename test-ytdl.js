import youtubedl from 'youtube-dl-exec';

async function testYTDL() {
  const videoUrl = 'https://www.youtube.com/watch?v=qkBjCjvX64o';
  try {
    const output = await youtubedl(videoUrl, {
      dumpJson: true,
      skipDownload: true,
      subLang: 'es,en',
      writeAutoSub: true,
      writeSub: true
    });
    
    // Check if subtitles exist
    const subs = output.subtitles || output.automatic_captions;
    if (subs) {
      console.log("Found subs langs:", Object.keys(subs));
      const esSubs = subs['es'] || subs['en'] || Object.values(subs)[0];
      const bestSub = esSubs.find(s => s.ext === 'json3') || esSubs.find(s => s.ext === 'vtt') || esSubs[0];
      console.log("Fetching sub from URL:", bestSub.url);
      const subRes = await fetch(bestSub.url);
      const subText = await subRes.text();
      console.log("Sub content starts with:", subText.substring(0, 200));
    } else {
      console.log("No subs found in yt-dlp output");
    }
  } catch (error) {
    console.error("yt-dlp error:", error.message);
  }
}

testYTDL();
