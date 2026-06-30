async function testLemnos() {
  const videoId = 'yOOOvy7JqrY';
  try {
    const res = await fetch(`https://yt.lemnoslife.com/noKey/captions?part=id&videoId=${videoId}`);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
testLemnos();
