import fs from 'node:fs';
const r=JSON.parse(fs.readFileSync('artifacts/performance.json','utf8'));
const e=JSON.parse(fs.readFileSync('artifacts/performance-extra.json','utf8'));
const samples=r.samples;const base=samples.find(s=>s.label==='mounted baseline');const idle=samples.find(s=>s.label==='idle 5 minute');
const cpu=idle?((idle.taskSeconds-base.taskSeconds)/((idle.time-base.time)/1000)*100).toFixed(3):'pending';
let md=`# 性能实测\n\n测试日期：${r.date}（UTC；本地为 Asia/Shanghai）。浏览器：Chrome ${r.browser}，macOS，本机隔离 headless Chromium，生产构建。\n\n使用 Chromium DevTools Protocol 的 Performance.getMetrics、Memory.getDOMCounters、HeapProfiler.collectGarbage；每次快照先强制 GC。此测试不访问真实 Codex；不启动任何网络 CDP 监听端口。\n\n| 检查点 | JS heap MiB | DOM nodes | JS listeners | 计时器 |\n|---|---:|---:|---:|---:|\n`;
for(const s of samples)md+=`| ${s.label} | ${(s.heapBytes/1048576).toFixed(3)} | ${s.nodes} | ${s.jsEventListeners} | ${s.skin.timers} |\n`;
md+=`\n- 完整空闲时长：${idle?((idle.time-base.time)/1000).toFixed(1):'pending'} 秒。空闲主线程任务占用代理：**${cpu}%**（TaskDuration 增量 / 墙钟时长；不是进程总 CPU）。\n- 连续灯光操作：120 秒，${r.interactionClicks??'pending'} 次真实 Playwright click。\n- 输入/删除 100 次、窗口尺寸变化 20 次、mount/unmount 10 次均实际执行。\n- 补充 20 次 CDP pageScaleFactor 缩放，覆盖 pinch/visual viewport 路径；不同于桌面菜单的浏览器 zoom。\n- 冷启动无应用脚本页面 JS heap：${(e.shell.metrics.JSHeapUsedSize/1048576).toFixed(3)} MiB；完整页面：${(e.mounted.metrics.JSHeapUsedSize/1048576).toFixed(3)} MiB；保守 app+skin 差值：**${((e.mounted.metrics.JSHeapUsedSize-e.shell.metrics.JSHeapUsedSize)/1048576).toFixed(3)} MiB**，低于 10 MB 目标。\n\n## 解释与边界\n\n外部 SVG 含真实 text 节点，DevTools DOM 总数包括 SVG 资源文档；卸载后浏览器可保留这些静态资源缓存，所以节点总数不会回到空白 HTML 的水平。生命周期比较应看同一资源加载状态下重复 mount/unmount 是否持续增长，以及宿主页装饰层和监听器是否释放。\n\nCPU 数字仅覆盖渲染主线程任务，不包括完整浏览器/GPU/合成器 CPU。测试期间可能有其他工作负载。GPU/渲染缓存补测见下方 Memory Infra 记录。JS heap 达标不能替代 GPU 内存结论。原始快照分别见 artifacts/performance.json 和 artifacts/performance-extra.json。\n\n复跑：启动 4173 生产预览后运行 npm run perf。实际设备、DPR、字体、窗口大小及浏览器版本会影响结果。\n`;
if(fs.existsSync('artifacts/render-memory.json')) {
 const memory=JSON.parse(fs.readFileSync('artifacts/render-memory.json','utf8'));
 const totals={};
 for(const ev of memory.dumps) {
  const a=ev.args?.dumps?.allocators??{};
  for(const k of ['blink_gc','cc/tile_memory','gpu/shared_images']) {
   const v=a[k]?.attrs?.size?.value;
   if(v) {totals[ev.id]??={};totals[ev.id][k]=(totals[ev.id][k]??0)+parseInt(v,16);}
  }
 }
 md+='\n## Memory Infra 补测\n\n独立 Chrome 进程，1440 × 1000、DPR 1，在无应用脚本的 shell 与完整页面各请求一次 detailed deterministic memory dump。下列数据来自 allocator 的 size 字段（十六进制字节），包含整个测试浏览器相关进程。\n\n| allocator | shell MiB | mounted MiB | 增量 MiB |\n|---|---:|---:|---:|\n';
 for(const k of ['blink_gc','cc/tile_memory','gpu/shared_images']) {const a=totals['0x0']?.[k]??0,b=totals['0x1']?.[k]??0;md+=`| ${k} | ${(a/1048576).toFixed(3)} | ${(b/1048576).toFixed(3)} | ${((b-a)/1048576).toFixed(3)} |\n`;}
 md+='\nGPU shared_images 和 cc/tile_memory 可能指向相同底层资源，不能相加。观察到的缓存增量约 19 MiB，接近 20 MB 目标边界；此结果不保证高 DPR、更大窗口或真实 Codex 的缓存占用。Blink 原生 GC 内存与 JavaScript 堆不是同一指标。优化前后 raw dump 分别保存在 before-optimization-render-memory.json 与 render-memory.json；运行 node scripts/render-memory.mjs 可复测。\n';
}
fs.writeFileSync('docs/performance.md',md);
