async function test() {
  console.log("Fetching HTML...");
  const htmlResponse = await fetch("https://www.youtube.com/watch?v=yOOOvy7JqrY");
  console.log("Got response:", htmlResponse.status);
  const htmlText = await htmlResponse.text();
  console.log("Got text, length:", htmlText.length);
  const titleMatch = htmlText.match(/<title>(.*?)<\/title>/);
  console.log("Title:", titleMatch ? titleMatch[1] : null);
}
test();
