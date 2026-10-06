async function run() {
  const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/DE0389527E5D2FA9F3C5CA9A25987B3A');
  await new Promise(r => ws.onopen = r);
  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      awaitPromise: true,
      returnByValue: true,
      expression: `new Promise((resolve) => {
        const v = document.createElement('video');
        v.src = '/loading.mp4';
        v.onloadedmetadata = () => {
          resolve({ width: v.videoWidth, height: v.videoHeight, duration: v.duration });
        };
        v.onerror = (e) => resolve({ error: 'failed to load video' });
      })`
    }
  }));
  ws.onmessage = (e) => {
    console.log(JSON.stringify(JSON.parse(e.data).result?.result?.value, null, 2));
    process.exit(0);
  };
}
run();
