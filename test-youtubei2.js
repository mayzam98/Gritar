import { Innertube } from 'youtubei.js';

async function testYoutubei() {
  try {
    const yt = await Innertube.create({ gl: 'US', hl: 'es' });
    const info = await yt.getInfo('qkBjCjvX64o');
    const transcriptData = await info.getTranscript();
    if (transcriptData && transcriptData.transcript && transcriptData.transcript.content) {
      const text = transcriptData.transcript.content.body.initial_segments.map(seg => `[${parseInt(seg.start_ms)/1000}] ${seg.snippet.text}`).join('\n');
      console.log(text.substring(0, 200));
    }
  } catch (error) {
    console.error(error.message);
  }
}
testYoutubei();
