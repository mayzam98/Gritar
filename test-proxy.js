import { HttpsProxyAgent } from 'https-proxy-agent';
import { YoutubeTranscript } from 'youtube-transcript';

async function testProxy() {
  console.log("Fetching proxies...");
  const proxyRes = await fetch('https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt');
  const proxyText = await proxyRes.text();
  const proxies = proxyText.split('\n').filter(p => p.trim().length > 0);
  console.log(`Found ${proxies.length} proxies. Testing random ones...`);
  
  for (let i = 0; i < 5; i++) {
    const proxy = proxies[Math.floor(Math.random() * proxies.length)];
    console.log("Trying proxy:", proxy);
    try {
      const agent = new HttpsProxyAgent(`http://${proxy}`);
      
      const customFetch = (url, options) => {
        options = options || {};
        options.agent = agent;
        options.headers = {
          ...options.headers,
          'Accept-Language': 'es,en;q=0.9',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        };
        // Node 18+ native fetch doesn't support 'agent' option, we need node-fetch for this!
        return fetch(url, options); 
      };
      // Note: YoutubeTranscript uses native fetch if available, but it doesn't support proxy agents easily unless we use node-fetch.
      
    } catch (e) {
      console.log("Failed with proxy", proxy, e.message);
    }
  }
}
testProxy();
