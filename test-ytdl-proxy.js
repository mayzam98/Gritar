import youtubedl from 'youtube-dl-exec';

async function testYtdlProxy() {
  const videoUrl = 'https://www.youtube.com/watch?v=qkBjCjvX64o';
  console.log("Fetching proxies...");
  const proxyRes = await fetch('https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt');
  const proxyText = await proxyRes.text();
  const proxies = proxyText.split('\n').filter(p => p.trim().length > 0);
  console.log(`Found ${proxies.length} proxies.`);
  
  for (let i = 0; i < 5; i++) {
    const proxy = proxies[Math.floor(Math.random() * proxies.length)];
    console.log("Trying yt-dlp with proxy:", proxy);
    try {
      const output = await youtubedl(videoUrl, {
        dumpJson: true,
        skipDownload: true,
        writeAutoSub: true,
        writeSub: true,
        proxy: `http://${proxy}`,
        extractorArgs: 'youtube:player_client=android'
      });
      console.log("SUCCESS!", Object.keys(output.subtitles || output.automatic_captions || {}));
      return;
    } catch(e) {
      console.log("Failed proxy:", e.message.split('\n')[0]);
    }
  }
}
testYtdlProxy();
