import {chromium} from '@playwright/test';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const client=await page.context().newCDPSession(page);
await client.send('Performance.enable');
const report={date:new Date().toISOString(),browser:browser.version(),method:'Isolated Chrome headless via DevTools Protocol pipe; renderer TaskDuration is CPU proxy, not whole-process OS CPU. GC forced before snapshots. No Codex connection.',samples:[]};
await page.goto('http://127.0.0.1:4173');await page.waitForSelector('.light');
async function sample(label){await client.send('HeapProfiler.collectGarbage');const m=Object.fromEntries((await client.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));const dom=await client.send('Memory.getDOMCounters');const data={label,time:Date.now(),heapBytes:m.JSHeapUsedSize,taskSeconds:m.TaskDuration,...dom,skin:await page.evaluate(()=>window.stranger.engine.diagnostics)};report.samples.push(data);fs.writeFileSync('artifacts/performance.json',JSON.stringify(report,null,2));console.log(label,JSON.stringify(data));}
await page.evaluate(()=>window.stranger.engine.unmount());await sample('unmounted baseline');await page.evaluate(()=>window.stranger.engine.mount());await sample('mounted baseline');
for(let i=1;i<=5;i++){await page.waitForTimeout(60_000);await sample(`idle ${i} minute`);}
await page.locator('#english').check({force:true});
const start=Date.now();let clicks=0;
while(Date.now()-start<120_000){await page.locator(`[data-letter="${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[clicks%26]}"]`).click();clicks++;await page.waitForTimeout(200);}
report.interactionClicks=clicks;await sample('2 minutes lamp interaction');
for(let i=0;i<100;i++){await page.locator('#message').press('Meta+a');await page.locator('#message').press('Backspace');await page.locator('#message').pressSequentially('HELLO');}await sample('100 input delete cycles');
for(let i=0;i<20;i++)await page.setViewportSize({width:800+i*25,height:950});await sample('20 resizes');
for(let i=0;i<10;i++){await page.evaluate(()=>{window.stranger.engine.unmount();window.stranger.engine.mount();});await sample(`mount cycle ${i+1}`);}
await page.evaluate(()=>window.stranger.engine.unmount());await sample('final unmounted');await browser.close();
