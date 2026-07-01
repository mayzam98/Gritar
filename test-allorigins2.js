async function test() {
  const url = "https://www.youtube.com/watch?v=rlBVNjLNsuI";
  const proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(url);
  const res = await fetch(proxyUrl);
  const text = await res.text();
  const match = text.match(/"captionTracks":\s*(\[.*?\])/);
  if (match) {
    console.log("Found it using allorigins!");
  } else {
    console.log("Not found with allorigins");
  }
}
test();
