async function testInvidious() {
  const instances = [
    'https://vid.puffyan.us',
    'https://inv.tux.pizza',
    'https://invidious.jing.rocks',
    'https://invidious.nerdvpn.de'
  ];
  
  const videoId = 'yOOOvy7JqrY';
  
  for (const instance of instances) {
    console.log(`Testing ${instance}...`);
    try {
      const res = await fetch(`${instance}/api/v1/videos/${videoId}`);
      const data = await res.json();
      if (data.captions && data.captions.length > 0) {
        console.log(`Found captions on ${instance}:`, data.captions.map(c => c.label));
        return; // Success
      } else {
        console.log(`No captions on ${instance}`);
      }
    } catch (e) {
      console.log(`Failed on ${instance}:`, e.message);
    }
  }
}
testInvidious();
