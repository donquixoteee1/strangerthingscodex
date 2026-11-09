import {chromium} from '@playwright/test';
import fs from 'node:fs';
const b=await chromium.launch({channel:'chrome',headless:true});
const p=await b.newPage({viewport:{width:1440,height:1000}});
const c=await p.context().newCDPSession(p);await c.send('Performance.enable');
const snapshot=async()=>{await c.send('HeapProfiler.collectGarbage');return {metrics:Object.fromEntries((await c.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value])),dom:await c.send('Memory.getDOMCounters')};};
await p.route('**/assets/*.js',route=>route.abort());await p.goto('http://127.0.0.1:4173');const shell=await snapshot();
await p.unroute('**/assets/*.js');await p.reload();await p.waitForSelector('.light');const mounted=await snapshot();
for(let i=0;i<20;i++){await c.send('Emulation.setPageScaleFactor',{pageScaleFactor:1+(i%5)*.2});await p.waitForTimeout(50);}
await c.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});const zoomed=await snapshot();
const report={method:'Cold shell blocks application JS and never loads SVG. Conservative app+skin heap difference. Twenty CDP visual page-scale changes in addition to viewport-resize test. These simulate pinch zoom, not desktop browser menu zoom.',shell,mounted,zoomed};
fs.writeFileSync('artifacts/performance-extra.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));await b.close();
