# Local macOS test installation

Installed desktop application: `~/Desktop/Stranger Codex.app`.
Runtime: `~/.codex/strangerthingscodex/`.

The launcher follows the Genesis local launch approach, using its own loopback debugging port (9361). It does not modify the signed Codex application bundle or the Genesis installation. The native integration is experimental; fixture tests are not proof of compatibility with a live Codex window.

## Start

Save your work, quit Codex normally with Command-Q, then double-click **Stranger Codex** on the desktop. Open a new chat. The launcher mounts the animation when it recognizes the supported home and composer structure. Pixel and ASCII modes retain their Size controls. The adapter does not submit messages or write to the native editor.

The launcher does not forcibly stop an existing Codex process. If Codex is already running without the local endpoint, it asks for a normal restart.

## Remove and restore

Use **Remove skin** to remove the current animation. To stop the launcher and its automatic reload injection, run:

```sh
/Applications/ChatGPT.app/Contents/Resources/cua_node/bin/node "$HOME/.codex/strangerthingscodex/launcher.mjs" --stop
```

Quit Codex normally, then start the original Codex app to close the local debug endpoint. After stopping the launcher, the desktop app and its runtime folder can be moved to Trash to uninstall this local test installation.

## Verification

Build, five unit tests, native bridge fixture tests, and launcher syntax/plist checks passed. Process detection correctly returns `restart-required` for an already running Codex without port 9361. Actual native rendering remains pending restart and visual inspection. See `~/.codex/strangerthingscodex/status.json` for runtime status; it records state and errors, not conversation text.
