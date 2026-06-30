import youtubedl from 'youtube-dl-exec';

async function testYTDLClient() {
  const videoUrl = 'https://www.youtube.com/watch?v=qkBjCjvX64o';
  try {
    const output = await youtubedl(videoUrl, {
      dumpJson: true,
      skipDownload: true,
      writeAutoSub: true,
      writeSub: true,
      extractorArgs: 'youtube:player_client=android'
    });
    
    let subs = output.subtitles;
    if (!subs || Object.keys(subs).length === 0) {
      subs = output.automatic_captions;
    }
    
    if (subs) {
      const esSubs = subs['es'] || subs['en'] || Object.values(subs)[0];
      const bestSub = esSubs.find(s => s.ext === 'json3');
      if (bestSub) {
        console.log("Found json3 sub url:", bestSub.url);
        const res = await fetch(bestSub.url);
        const data = await res.json();
        console.log("Data extracted:", data.events.length, "events");
        
        let text = data.events.map(e => {
          if (!e.segs) return null;
          return `[${Math.floor(e.tStartMs/1000)}] ` + e.segs.map(s => s.utf8).join('');
        }).filter(Boolean).join('\n');
        console.log("Sample:", text.substring(0, 200));
      } else {
        console.log("No json3 found");
      }
    }
  } catch (error) {
    console.error("yt-dlp error:", error.message);
  }
}
testYTDLClient();
