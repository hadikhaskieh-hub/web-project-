// Renders reel.html frame by frame.
//   node render.js stills 3.2 9.5 ...   -> PNG stills of given times (for review)
//   node render.js frames               -> every frame at 30fps into $OUT/frames
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const FPS = 30;
const WORKERS = 4;
const OUT = process.env.OUT || path.join(__dirname, '..', 'build');
const PAGE = 'file://' + path.join(__dirname, 'reel-v1.html');

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto(PAGE);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every(i => i.complete));
  return page;
}

(async () => {
  const [mode, ...times] = process.argv.slice(2);
  const browser = await chromium.launch();
  if (mode === 'stills') {
    fs.mkdirSync(path.join(OUT, 'stills'), { recursive: true });
    const page = await openPage(browser);
    for (const t of times) {
      await page.evaluate(t => seek(t), +t);
      await page.screenshot({ path: path.join(OUT, 'stills', `t${t}.png`) });
    }
  } else {
    const dir = path.join(OUT, 'frames');
    fs.mkdirSync(dir, { recursive: true });
    const total = Math.round(30 * FPS);
    let next = 0;
    await Promise.all(Array.from({ length: WORKERS }, async () => {
      const page = await openPage(browser);
      while (next < total) {
        const f = next++;
        await page.evaluate(t => seek(t), f / FPS);
        await page.screenshot({ path: path.join(dir, `f${String(f).padStart(4, '0')}.png`) });
      }
    }));
  }
  await browser.close();
})();
