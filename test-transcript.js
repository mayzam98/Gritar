import { YoutubeTranscript } from 'youtube-transcript';

async function test() {
  try {
    const transcriptArray = await YoutubeTranscript.fetchTranscript('https://www.youtube.com/watch?v=yOOOvy7JqrY');
    console.log(transcriptArray);
  } catch (error) {
    console.error(error);
  }
}

test();
