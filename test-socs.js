import { YoutubeTranscript } from 'youtube-transcript';

async function testWithSOCS() {
  const customFetch = (url, options) => {
    options = options || {};
    options.headers = {
      ...options.headers,
      'Cookie': 'SOCS=CAI',
      'Accept-Language': 'es,en;q=0.9',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    return fetch(url, options);
  };

  try {
    const transcriptArray = await YoutubeTranscript.fetchTranscript('https://www.youtube.com/watch?v=qkBjCjvX64o', { fetch: customFetch });
    console.log("Success! Found:", transcriptArray.length, "lines");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testWithSOCS();
