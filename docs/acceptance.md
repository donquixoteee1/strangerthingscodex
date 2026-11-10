# 阶段验收

| 阶段 | 本次结果 | 证据与限制 |
|---|---|---|
| 1 | 已实现参考图派生 ASCII 场景 | 桌面 1.jpg 镜像、沙发裁切与轮廓修正，三个真实字符 SVG；2.png 结构、3.png 稀疏风格；最终视觉相似度待用户评审 |
| 2 | 已实现 26 灯与悬停/常亮 | 浏览器确认 26 按钮、hover 进入/退出、点击灯光计数 |
| 3 | 已实现独立预览双向输入 | HELLO、重复删除、光标中插、选区替换、原生剪贴板、撤销重做、本地提交清空 |
| 4 | 已实现空闲、模式和合成保护 | 假时钟推进 20001ms 验证文字/选区/节点身份不变；合成事件防写；visibility 事件路径与减少动态效果测试 |
| 5 | 自动化及实测 | 单元、浏览器、生产构建、7 分钟性能测量；见 performance.md。操作系统 IME 仍需人工测量；GPU 缓存已附本机 Memory Infra 补测 |
| 6 | 完成只读研究 | 本机版本与 app.asar 存在性；官方文档、两社区仓库的挂载/选择器/清理设计，见 compatibility.md |
| 7 | 未接入真实客户端 | 没有授权启动隔离 Codex CDP，缺少已验证的编辑桥接；只读安全退化，不宣称实机成功 |

## 自动化对应

- `light-state.test.ts`：大小写、重复、非 ASCII 忽略、仅刷新变化灯。
- `input-sync.test.ts`：模式、合成、只读门禁。
- `idle-timer.test.ts`：20 秒、活动重置、计时器上界与清理。
- `lifecycle.test.ts`：10 次调度生命周期。
- `preview.spec.ts`：桌面布局/0.7 比例、hover、HELLO、两次删除、中插/替换、撤销/重做、剪贴板、清空、IME、20 秒不变、10 次启停、20 次窗口缩放、窄屏无横向溢出、安全降级、隐藏事件与卸载后原生输入。

真实系统输入法、真实客户端提交不在上述自动通过范围内；GPU 补测仅代表当前独立测试浏览器。预览的模型/权限/附件控件为参考 UI，不执行真实模型选择、权限修改或附件上传。

## 2026-11-08 交付核对

项目已迁至 assistant 工作区的 stranger-codex 子目录。页面欢迎语改为「你想在这里构建什么？」，项目栏统一 Stranger Codex；源文件、构建产物和截图清除此前工作区名称。独立 Vite PostCSS 配置避免继承父目录工具链。

优化后的三个 SVG 共 336 个 text 节点，静态场景文件总计 98,170 字节。完整性能测试于 2026-11-06 完成，原始记录保留实际时间，未将历史测试日期改为本次交付日期。

## 2026-11-08 palette and language update

The UI now uses neutral charcoal #181818, neutral composer surfaces, warm brown/amber ASCII furniture and wallpaper, and red/green/blue/warm-yellow bulbs based on the supplied reference. All visible and accessible UI strings, including dynamic status/error messages, are English. Build and nine browser integration tests passed after this update. Earlier performance records describe the preceding palette; the timing and input architecture is unchanged.

## Cinematic opening update

Removed scene labels, signal counters and footer microcopy. Background is neutral #121212. Added shuffled 26-lamp introduction with variable 180–480 ms scheduling, overlapping soft CSS pulses, and sparse ambient illumination after the opening. This reuses the existing scheduler. Pause, reduced motion and unmount cancel the opening; re-mount does not replay it. Browser integration suite: 10 passed, including opening cancellation and no text mutation. Previous long-duration performance records predate this animation update and are not a measurement of the new opening.

## ASCII typography and lighting update

Lamp cores and light fields now use literal preformatted ASCII text. CSS animates only opacity/color, with no radial-gradient glow or rounded bulb. Title uses a precomputed text-only title.svg with an accessible heading. Sofa palette is less saturated. Build and 10 browser tests passed. Earlier memory measurements predate the additional title and halo nodes.

## Reference alphabet proportions

Extracted painted dark strokes from manually bounded A–Z crops. Preserved source dimensions and light offsets in a 920 × 450 coordinate space; source bounds and lamp centers are stored in scene-layout.json. Continuous serpentine cable paths replace regular scallops. ASCII bulb visual size scales with the scene using container units while pointer targets remain larger. Source alphabet is kept readable left-to-right. Ten browser interaction tests passed after geometry changes. Previous performance records do not measure the denser new alphabet.

## Sparse animated letter update

The painted alphabet uses a 4px sampling grid instead of 2px, with three precomputed character variants. One-third of occupied cells changes punctuation/brightness; positions and outline remain stable. Cached SVG variants cycle from the existing ambient scheduler with a minimum 1800ms interval. Motion off/reduced-motion/hidden state stops advancement. Brighter ASCII lamp cores and fields retain the prior source proportions. The new browser test checks changing frames, stable DOM count, unchanged message text and freezing on Motion off. Prior memory records predate these cached variants.
