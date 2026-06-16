import { YoutubeTranscript } from 'youtube-transcript';

async function test() {
  try {
    const transcriptArray = await YoutubeTranscript.fetchTranscript('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    console.log("Success! " + transcriptArray.length + " lines.");
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
