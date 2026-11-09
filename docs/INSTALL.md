# Installation status

**Standalone preview: runnable. Native Codex skin: experimental, not install-ready.**

## Preview

Requires Node.js 22.12 or newer and npm.

```sh
npm ci
npm run build
npx vite preview --host 127.0.0.1 --port 4173
```

Open http://127.0.0.1:4173. Stop the terminal process to shut down. No Codex files or settings are changed. The preview's Send button is local only.

## Native integration developer bundle

```sh
npm run build:native
npm run doctor
```

`native-dist/stranger-skin.js` is a self-contained experimental IIFE exposing `StrangerSkin.mount`, `StrangerSkin.unmount`, and `StrangerSkin.compatibility`. Images and CSS are embedded; styles are isolated in a shadow root. A host integration must supply verified connected `container`, `composer`, and `editor` DOM elements. The container must already be positioned. The module does not guess selectors, open a debug port, patch the application, install startup jobs, or execute itself inside Codex.

The bridge reads input to illuminate letters. It never writes to the native editor, clicks Send, or replaces the composer. Native lamps are decorative and excluded from keyboard navigation. Pixel / ASCII, Size and Motion controls remain available. `Remove skin` or `StrangerSkin.unmount()` cleans up the module. Detaching the supplied editor automatically removes the skin; a host integration must explicitly remount on the next verified screen.

`doctor` exits with code 2 while real Codex integration remains unverified. This is an intentional block, not a successful installation result. There is no one-click Codex installer in this release. Do not import this repository or bundle as a Dream Skin theme ZIP: that format does not allow this JavaScript runtime.

## Validation boundary

Browser fixture tests verify read-only text synchronization, isolated styles, mode controls, repeat mounting, detached-editor cleanup and unchanged native input. They do not establish compatibility with the real Codex desktop application. Before advertising native installation, validate an authorized loading path and actual Codex home screen, chat transitions, typing, selection, IME, undo, Send, focus and complete removal on the target version. Keep native letter insertion disabled until separately validated.
