// Headless checks for the rebuilt atlas: desktop and iPhone-size viewports. Usage: node test.js [url]
const { chromium, devices } = require('playwright');
const URL0 = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
async function run(name, ctxOpts, mobile) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  const errors = [], tiles = { n: 0, hosts: new Set() }, failed = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text().slice(0, 200)); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message.slice(0, 300)));
  page.on('requestfailed', r => failed.push(r.url().slice(0, 120)));
  await page.route(/arcgisonline|nationalmap\.gov|amazonaws|cdnjs/, r => { tiles.n++; tiles.hosts.add(new URL(r.request().url()).hostname); r.fulfill({ status: 200, contentType: 'image/png', body: PNG }); });
  const t0 = Date.now();
  await page.goto(URL0, { waitUntil: 'load' });
  const tload = Date.now() - t0;
  await page.waitForTimeout(1200);
  const state = () => page.evaluate(() => ({
    ver: document.documentElement.dataset.og, pts: PTS.length, vb: vb, scale: Math.round(scale()), queued: PCV.q.length, drawn: PCV.dr.length, clusters: PCV.cls.length,
    tilesB: tlStreet.tiles.size, tilesH: tlHill.tiles.size, ogt: document.body.classList.contains('ogt'), shell: document.body.classList.contains('shell'), tab: document.body.dataset.tab,
    log: OGE.log.slice(), viewBox: svg.getAttribute('viewBox'), stage: stage.style.transform, mode: SH.mode, on: [...on].length, streams: typeof STR !== 'undefined' ? STR.p.length : -1,
  }));
  let st = await state();
  console.log(`\n=== ${name}: load ${tload} ms; v${st.ver}; ${st.pts} spots; scale ${st.scale}; queued ${st.queued}, painted ${st.drawn}, bubbles ${st.clusters}; tiles street ${st.tilesB} hill ${st.tilesH}; ogt ${st.ogt}; shell ${st.shell} tab ${st.tab}; mode ${st.mode}; layers on ${st.on}; streams ${st.streams}`);
  if (st.log.length) console.log('OGE.log:', st.log);
  // 1. tap a painted pin -> pop (desktop) or card (phone)
  const pin = await page.evaluate(() => { const r = svgRect(); const d = PCV.dr.find(([p, x, y]) => x > 60 && y > 120 && x < r.width - 60 && y < r.height - 160 && !PCV.cls.some(c => Math.hypot((c.p.lo * K - vb.x) * scale() - x, (-c.p.la - vb.y) * scale() - y) < 30)); return d ? { id: d[0].id, n: d[0].n, x: d[1] + r.left, y: d[2] + r.top } : null; });
  if (!pin) console.log('!! no pin to tap'); else {
    if (mobile) await page.touchscreen.tap(pin.x, pin.y); else await page.mouse.click(pin.x, pin.y);
    await page.waitForTimeout(400);
    const r = await page.evaluate(() => ({ pop: !document.getElementById('pop').hidden, popH4: document.querySelector('#pop h4')?.textContent, card: document.querySelector('#detail h2')?.textContent, sheet: document.getElementById('shSheet') && !document.getElementById('shSheet').hidden, cld: !document.getElementById('cld').hidden, sel: selId }));
    console.log('tap pin', JSON.stringify(pin.n), '->', JSON.stringify(r));
    if (!mobile && r.pop) { await page.click('#popMore'); await page.waitForTimeout(300); console.log('Full details ->', await page.evaluate(() => document.querySelector('#detail h2')?.textContent)); }
  }
  // 2. tap empty water closes; wheel zoom; drag
  const box = await page.evaluate(() => { const r = svgRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; });
  const cx = box.l + box.w / 2, cy = box.t + box.h / 2;
  if (!mobile) {
    await page.mouse.move(cx, cy); for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, -120); await page.waitForTimeout(40); }
    const mid = await page.evaluate(() => ({ stage: stage.style.transform, active: GES.active }));
    await page.waitForTimeout(500);
    st = await state(); console.log('wheel zoom x6: mid-gesture transform', mid.stage ? 'yes' : 'NO', '-> settled scale', st.scale, 'painted', st.drawn, 'tiles', st.tilesB, 'stage now', JSON.stringify(st.stage));
    await page.mouse.move(cx, cy); await page.mouse.down(); for (let i = 1; i <= 10; i++) { await page.mouse.move(cx + i * 20, cy + i * 8); await page.waitForTimeout(16); } await page.mouse.up();
    await page.waitForTimeout(700); const st2 = await state(); console.log('drag 200px: vb.x moved', (st2.vb.x - st.vb.x).toFixed(4), 'pop hidden', await page.evaluate(() => pop.hidden), 'painted', st2.drawn);
    await page.mouse.dblclick(cx, cy); await page.waitForTimeout(900); st = await state(); console.log('dblclick -> scale', st.scale);
  } else {
    // pinch with CDP touch events
    const cdp = await ctx.newCDPSession(page);
    const touch = async (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p[0], y: p[1], id: i })) });
    const s0 = (await state()).scale;
    await touch('touchStart', [[cx - 40, cy], [cx + 40, cy]]);
    for (let i = 1; i <= 12; i++) { await touch('touchMove', [[cx - 40 - i * 8, cy], [cx + 40 + i * 8, cy]]); await page.waitForTimeout(16); }
    const mid = await page.evaluate(() => ({ stage: stage.style.transform, active: GES.active, ptr: GES.ptr.size }));
    await touch('touchEnd', []);
    await page.waitForTimeout(600); st = await state();
    console.log('pinch out: mid transform', mid.stage ? 'yes' : 'NO', 'ptrs', mid.ptr, '-> scale', s0, '->', st.scale, 'painted', st.drawn, 'stage now', JSON.stringify(st.stage));
    await touch('touchStart', [[cx, cy]]); for (let i = 1; i <= 10; i++) { await touch('touchMove', [[cx + i * 15, cy + i * 5]]); await page.waitForTimeout(16); } await touch('touchEnd', []);
    await page.waitForTimeout(800); const st2 = await state(); console.log('one-finger drag: vb.x moved', (st2.vb.x - st.vb.x).toFixed(4), 'scale same', st2.scale === st.scale, 'painted', st2.drawn);
    // rotate
    await page.setViewportSize({ width: 844, height: 390 }); await page.waitForTimeout(500); const st3 = await state();
    await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(500); const st4 = await state();
    console.log('rotate: scale', st2.scale, '->', st3.scale, '->', st4.scale, '(center kept:', Math.abs((st4.vb.x + st4.vb.w / 2) - (st2.vb.x + st2.vb.w / 2)) < 1e-6, ')');
    // tabs
    for (const t of ['spots', 'hunt', 'more', 'map']) { await page.click(`#shTabs [data-t="${t}"]`); await page.waitForTimeout(250); }
    const st5 = await state(); console.log('tabs round trip: tab', st5.tab, 'painted', st5.drawn, 'scale', st5.scale);
    // mode chip menu + ID guide
    await page.click('#mcMode'); await page.waitForTimeout(200); console.log('mode menu open', await page.evaluate(() => !document.getElementById('mcMenu').hidden));
    await page.click('#mcMenu button[data-i]'); await page.waitForTimeout(300);
    await page.click('#mcId'); await page.waitForTimeout(200); await page.click('#mcIdMenu [data-g="coin"]'); await page.waitForTimeout(300);
    console.log('coin guide view', await page.evaluate(() => [...document.querySelectorAll('.readview:not([hidden])')].map(e => e.id).join(',')));
    await page.click('#shTabs [data-t="map"]'); await page.waitForTimeout(300);
  }
  // layers sheet + satellite + old maps + dark theme
  await page.click('#gmLayers'); await page.waitForTimeout(200);
  await page.click('#gmTypes [data-mt="sat"]'); await page.waitForTimeout(600); let s1 = await state(); const satN = await page.evaluate(() => tlSat.tiles.size);
  await page.click('#gmTypes [data-mt="old"]'); await page.waitForTimeout(400); const omOn = await page.evaluate(() => on.has('_oldmap') && gOM.style.display !== 'none');
  await page.click('#gmTypes [data-mt="default"]'); await page.waitForTimeout(400);
  console.log('map types: sat tiles', satN, 'old maps on', omOn, 'back to default tiles', (await state()).tilesB);
  await page.evaluate(() => shTheme('dark')); await page.waitForTimeout(500); st = await state(); console.log('dark theme: painted', st.drawn, 'tiles', st.tilesB); await page.evaluate(() => shTheme(''));
  await page.evaluate(() => gmSheet(false));
  // search
  await page.fill('#uxq', 'Irvine'); await page.waitForTimeout(400); const nres = await page.evaluate(() => document.querySelectorAll('#uxr button').length);
  await page.click('#uxr button'); await page.waitForTimeout(800); st = await state();
  console.log('search Irvine:', nres, 'results; picked ->', await page.evaluate(() => document.querySelector('#detail h2')?.textContent), 'scale', st.scale, 'painted', st.drawn);
  // streams layer on + zoom to town: canvas streams
  await page.evaluate(() => { on.add('_streams'); drawMarkers.now(); }); await page.waitForTimeout(1500);
  st = await state(); console.log('streams built', st.streams, 'visible now', await page.evaluate(() => streamsVis(scale()).length));
  // memory / nodes
  const dom = await page.evaluate(() => ({ nodes: document.getElementsByTagName('*').length, svgNodes: svg.getElementsByTagName('*').length, imgs: document.querySelectorAll('.ogtile').length }));
  console.log('DOM nodes', dom.nodes, 'svg nodes', dom.svgNodes, 'tile imgs', dom.imgs);
  st = await state(); if (st.log.length) console.log('OGE.log:', st.log);
  console.log('console errors:', errors.length ? errors.slice(0, 12) : 'none', '| failed requests:', failed.filter(u => !/arcgis|nationalmap/.test(u)).slice(0, 8));
  await page.screenshot({ path: `/tmp/claude-0/-home-claude-gold-atlas/3256a0eb-ea88-5e14-b383-764e6b51ce2a/scratchpad/shot-${name}.png` });
  await browser.close();
}
(async () => {
  await run('desktop', { viewport: { width: 1280, height: 800 } }, false);
  await run('iphone', { ...devices['iPhone 13'] }, true);
})().catch(e => { console.error(e); process.exit(1); });
