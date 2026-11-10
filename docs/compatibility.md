# 真实客户端兼容性记录

记录日期：2026-11-06。此文不构成真实客户端验收通过声明。

## 本机只读检查

- `/Applications/ChatGPT.app`：bundle identifier `com.openai.codex`，版本 `26.1016.62342`，build `21477`，可执行文件 `ChatGPT`。
- 发现 Electron 资源容器 `Contents/Resources/app.asar`，没有解包、改写或重签名。
- 已安装 `/Applications/Codex Dream Skin.app`，版本 `1.5.21`。本次没有启动、停止或修改这个现有工具。
- 本次没有连接实际 Codex renderer，没有访问工作聊天，没有启动真实客户端 CDP。

## 官方能力与社区研究

[官方 Settings 文档](https://learn.chatgpt.com/docs/reference/settings) 描述 base theme、accent/background/foreground、字体和主题分享。此次查阅未发现供外部皮肤挂载交互 DOM 或写入聊天编辑器的官方接口。此结论是本次文档范围内的发现，并非断言未来不存在接口。

已只读查阅两个社区仓库的 README、`runtime/renderer-inject.js`、`tools/selectors.json`、`macos/references/runtime-notes.md`：

- [Fei-Away/Codex-Dream-Skin](https://github.com/Fei-Away/Codex-Dream-Skin)，检查时 main SHA `6fc42df48a6a5365011f55cc349e20c038e56d1d`。
- [CCDawn/Codex-Dynamic-Skin](https://github.com/CCDawn/Codex-Dynamic-Skin)，检查时 main SHA `5a0e74043b63ed9518ab37cdcf6865340a57006c`。

两者通过本机 loopback CDP 挂载装饰层。选择器合同采用语义属性和 CSS Modules 前缀、多路兼容与分级降级；已有实例的 cleanup 会在重装前调用。选择器合同记录了截至 26.924 等版本的验证证据，不能视为当前本机 26.1016 的适配证明。仅保存合同数据作研究记录，未加载到产品运行时，未复制或执行注入器。

## 本项目的安全退化

`CodexAdapter` 接收调用者提供的 composer resolver；默认返回 null。失效节点和 resolver 异常返回空值。即使找到节点，`canWrite` 仍固定 false，`insertLetter` 固定拒绝。这是可编译、可测试的只读适配边界，不是已完成的实机插件。

真实客户端的挂载桥接、编辑器能力探测、SPA 节点重建适配、实际输入/删除/撤销/提交验证均待实机验证。不能用 PreviewAdapter 的 Chromium 测试证明这些能力。

## Phase 7 状态

未实施：缺少安全挂载入口、受验证的编辑器桥接与用户对隔离客户端 CDP 的明确授权。当前交付独立原型；未安装或注入真实 Codex，故无需恢复原生客户端。

后续若明确授权，应建立隔离 profile 和临时 CODEX_HOME、无敏感聊天、只绑定 127.0.0.1 的临时端口；先验证纯视觉 mount/unmount，再逐项验证编辑器读写、光标、选区、IME、撤销重做和真正提交。任意失败保持只读。结束后关闭整个隔离客户端，确认端口消失；停止注入器本身不等于关闭 CDP 端口。
