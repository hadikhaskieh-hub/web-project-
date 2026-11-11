// Renders ad.html frame by frame.
//   node render.js stills 9x16 3.2 9.5 ...   -> PNG stills at the given times (for review)
//   node render.js frames 9x16|1x1           -> every frame at 30fps into $OUT/frames-<ratio>
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const FPS = 30;
const WORKERS = 4;
const OUT = process.env.OUT || path.join(__dirname, '..', 'build');

(async () => {
  const [mode, ratio = '9x16', ...times] = process.argv.slice(2);
  const size = ratio === '1x1' ? { width: 1080, height: 1080 } : { width: 1080, height: 1920 };
  const url = 'file://' + path.join(__dirname, 'ad.html') + '?ar=' + ratio;
  // the light sweep is masked with the bag PNG, which file:// pages may only read with this flag
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const openPage = async () => {
    const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every(i => i.complete));
    return page;
  };
  if (mode === 'stills') {
    const dir = path.join(OUT, 'stills-' + ratio);
    fs.mkdirSync(dir, { recursive: true });
    const page = await openPage();
    for (const t of times) {
      await page.evaluate(t => seek(t), +t);
      await page.screenshot({ path: path.join(dir, `t${t}.png`) });
    }
  } else {
    const dir = path.join(OUT, 'frames-' + ratio);
    fs.mkdirSync(dir, { recursive: true });
    const first = await openPage();
    const total = Math.round(await first.evaluate(() => DURATION) * FPS);
    let next = 0;
    await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
      const page = w === 0 ? first : await openPage();
      while (next < total) {
        const f = next++;
        await page.evaluate(t => seek(t), f / FPS);
        await page.screenshot({ path: path.join(dir, `f${String(f).padStart(4, '0')}.png`) });
      }
    }));
  }
  await browser.close();
})();
