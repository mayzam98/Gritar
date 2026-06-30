import youtubedl from 'youtube-dl-exec';

async function testYTDL() {
  const videoUrl = 'https://www.youtube.com/watch?v=qkBjCjvX64o';
  try {
    const output = await youtubedl(videoUrl, {
      dumpJson: true,
      skipDownload: true,
      writeAutoSub: true,
      writeSub: true
    });
    console.log(Object.keys(output.subtitles || {}), Object.keys(output.automatic_captions || {}));
  } catch (error) {
    console.error("yt-dlp error:", error.message);
  }
}
testYTDL();
