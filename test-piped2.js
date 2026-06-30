async function testPiped() {
  const videoId = 'qkBjCjvX64o';
  const instances = ['https://pipedapi.tokhmi.xyz', 'https://pipedapi.smnz.de', 'https://pipedapi.lunar.icu'];
  
  for (let instance of instances) {
    try {
      const res = await fetch(`${instance}/streams/${videoId}`);
      const data = await res.json();
      if (data && data.subtitles && data.subtitles.length > 0) {
        console.log(`Success with ${instance}:`, data.subtitles.map(s => s.code));
        return;
      }
    } catch(e) {
      console.log(`Failed ${instance}`);
    }
  }
}
testPiped();
