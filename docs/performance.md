# 性能实测

测试日期：2026-11-06T02:16:20.322Z（UTC；本地为 Asia/Shanghai）。浏览器：Chrome 157.0.8103.38，macOS，本机隔离 headless Chromium，生产构建。

使用 Chromium DevTools Protocol 的 Performance.getMetrics、Memory.getDOMCounters、HeapProfiler.collectGarbage；每次快照先强制 GC。此测试不访问真实 Codex；不启动任何网络 CDP 监听端口。

| 检查点 | JS heap MiB | DOM nodes | JS listeners | 计时器 |
|---|---:|---:|---:|---:|
| unmounted baseline | 2.118 | 958 | 33 | 0 |
| mounted baseline | 2.148 | 1097 | 144 | 2 |
| idle 1 minute | 2.151 | 1097 | 144 | 1 |
| idle 2 minute | 2.151 | 1097 | 144 | 1 |
| idle 3 minute | 2.159 | 1097 | 144 | 1 |
| idle 4 minute | 2.159 | 1097 | 144 | 1 |
| idle 5 minute | 2.159 | 1097 | 144 | 1 |
| 2 minutes lamp interaction | 2.471 | 1308 | 144 | 2 |
| 100 input delete cycles | 2.473 | 1490 | 144 | 2 |
| 20 resizes | 2.474 | 1490 | 144 | 2 |
| mount cycle 1 | 2.464 | 1308 | 144 | 2 |
| mount cycle 2 | 2.465 | 1308 | 144 | 2 |
| mount cycle 3 | 2.464 | 1308 | 144 | 2 |
| mount cycle 4 | 2.464 | 1308 | 144 | 2 |
| mount cycle 5 | 2.464 | 1308 | 144 | 2 |
| mount cycle 6 | 2.464 | 1308 | 144 | 2 |
| mount cycle 7 | 2.478 | 1308 | 144 | 2 |
| mount cycle 8 | 2.485 | 1308 | 144 | 2 |
| mount cycle 9 | 2.486 | 1308 | 144 | 2 |
| mount cycle 10 | 2.486 | 1308 | 144 | 2 |
| final unmounted | 2.460 | 1138 | 33 | 0 |

- 完整空闲时长：300.1 秒。空闲主线程任务占用代理：**0.237%**（TaskDuration 增量 / 墙钟时长；不是进程总 CPU）。
- 连续灯光操作：120 秒，515 次真实 Playwright click。
- 输入/删除 100 次、窗口尺寸变化 20 次、mount/unmount 10 次均实际执行。
- 补充 20 次 CDP pageScaleFactor 缩放，覆盖 pinch/visual viewport 路径；不同于桌面菜单的浏览器 zoom。
- 冷启动无应用脚本页面 JS heap：0.582 MiB；完整页面：2.133 MiB；保守 app+skin 差值：**1.551 MiB**，低于 10 MB 目标。

## 解释与边界

外部 SVG 含真实 text 节点，DevTools DOM 总数包括 SVG 资源文档；卸载后浏览器可保留这些静态资源缓存，所以节点总数不会回到空白 HTML 的水平。生命周期比较应看同一资源加载状态下重复 mount/unmount 是否持续增长，以及宿主页装饰层和监听器是否释放。

CPU 数字仅覆盖渲染主线程任务，不包括完整浏览器/GPU/合成器 CPU。测试期间可能有其他工作负载。GPU/渲染缓存补测见下方 Memory Infra 记录。JS heap 达标不能替代 GPU 内存结论。原始快照分别见 artifacts/performance.json 和 artifacts/performance-extra.json。

复跑：启动 4173 生产预览后运行 npm run perf。实际设备、DPR、字体、窗口大小及浏览器版本会影响结果。

## Memory Infra 补测

独立 Chrome 进程，1440 × 1000、DPR 1，在无应用脚本的 shell 与完整页面各请求一次 detailed deterministic memory dump。下列数据来自 allocator 的 size 字段（十六进制字节），包含整个测试浏览器相关进程。

| allocator | shell MiB | mounted MiB | 增量 MiB |
|---|---:|---:|---:|
| blink_gc | 2.875 | 18.984 | 16.109 |
| cc/tile_memory | 13.172 | 32.203 | 19.031 |
| gpu/shared_images | 29.652 | 48.683 | 19.031 |

GPU shared_images 和 cc/tile_memory 可能指向相同底层资源，不能相加。观察到的缓存增量约 19 MiB，接近 20 MB 目标边界；此结果不保证高 DPR、更大窗口或真实 Codex 的缓存占用。Blink 原生 GC 内存与 JavaScript 堆不是同一指标。优化前后 raw dump 分别保存在 before-optimization-render-memory.json 与 render-memory.json；运行 node scripts/render-memory.mjs 可复测。
