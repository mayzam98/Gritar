async function testLemnos() {
  try {
    const res = await fetch(`https://yt.lemnoslife.com/videos?part=captions&id=qkBjCjvX64o`);
    const data = await res.json();
    console.log("Lemnos:", JSON.stringify(data).substring(0, 300));
  } catch(e) {
    console.error(e);
  }
}
testLemnos();
