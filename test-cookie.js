import { YoutubeTranscript } from 'youtube-transcript';

async function testWithCookie() {
  const customFetch = (url, options) => {
    options = options || {};
    options.headers = {
      ...options.headers,
      'Cookie': 'CONSENT=YES+cb.20230101-17-p0.es+FX+555',
      'Accept-Language': 'es,en;q=0.9'
    };
    return fetch(url, options);
  };

  try {
    const transcriptArray = await YoutubeTranscript.fetchTranscript('https://www.youtube.com/watch?v=yOOOvy7JqrY', { fetch: customFetch });
    console.log("Success! Found:", transcriptArray.length, "lines");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testWithCookie();
