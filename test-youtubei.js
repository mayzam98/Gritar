import { Innertube } from 'youtubei.js';

async function testYoutubei() {
  const yt = await Innertube.create();
  
  try {
    const info = await yt.getInfo('qkBjCjvX64o');
    const transcript = await info.getTranscript();
    
    if (transcript && transcript.transcript && transcript.transcript.content) {
      console.log("Got transcript! Items count:", transcript.transcript.content.body.initial_segments.length);
      const text = transcript.transcript.content.body.initial_segments.map(seg => `[${parseInt(seg.start_ms)/1000}] ${seg.snippet.text}`).join('\n');
      console.log(text.substring(0, 200));
    } else {
      console.log("No transcript found via youtubei.js");
    }
  } catch (error) {
    console.error("youtubei.js error:", error.message);
  }
}
testYoutubei();
