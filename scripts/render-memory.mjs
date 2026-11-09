import {chromium} from '@playwright/test';
import fs from 'node:fs';
const b=await chromium.launch({channel:'chrome',headless:true});const c=await b.newBrowserCDPSession();const p=await b.newPage({viewport:{width:1440,height:1000}});
const events=[];c.on('Tracing.dataCollected',d=>events.push(...d.value));
await c.send('Tracing.start',{transferMode:'ReportEvents',traceConfig:{recordMode:'recordContinuously',includedCategories:['disabled-by-default-memory-infra'],memoryDumpConfig:{triggers:[]}}});
await p.route('**/assets/*.js',r=>r.abort());await p.goto('http://127.0.0.1:4173');await p.waitForTimeout(500);const baseline=await c.send('Tracing.requestMemoryDump',{levelOfDetail:'detailed',deterministic:true});
await p.unroute('**/assets/*.js');await p.reload();await p.waitForSelector('.light');await p.waitForTimeout(500);const mounted=await c.send('Tracing.requestMemoryDump',{levelOfDetail:'detailed',deterministic:true});
const done=new Promise(r=>c.once('Tracing.tracingComplete',r));await c.send('Tracing.end');await done;
const dumps=events.filter(e=>e.ph==='v');
fs.writeFileSync('artifacts/render-memory.json',JSON.stringify({baseline,mounted,dumps},null,2));
for(const ev of dumps){const alloc=ev.args?.dumps?.allocators??{};const selected=Object.entries(alloc).filter(([k])=>/gpu|skia|discardable|texture|image|cc\/|blink_gc/i.test(k));console.log(JSON.stringify({pid:ev.pid,id:ev.id,allocators:selected.slice(0,30)}));}
await b.close();
