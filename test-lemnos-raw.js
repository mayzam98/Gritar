async function testLemnosRaw() {
  const videoId = 'qkBjCjvX64o';
  try {
    const res = await fetch(`https://yt.lemnoslife.com/noKey/captions?part=id&videoId=${videoId}`);
    const text = await res.text();
    console.log(text.substring(0, 500));
  } catch(e) {
    console.error(e);
  }
}
testLemnosRaw();
