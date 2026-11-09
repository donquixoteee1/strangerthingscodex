# Stranger Things Codex

A dark living-room scene with glowing alphabet lights, crisp pixels and animated ASCII. Built with TypeScript and Vite, without a runtime UI framework.

**Status: standalone preview ready; native Codex integration is experimental and not yet install-ready.** This is an unofficial project, not an OpenAI plugin or a Dream Skin import package. See [installation and compatibility](docs/INSTALL.md).

## Run locally

Node.js 22.12+ is required.

```sh
npm ci
npm run dev -- --port 5173
```

For a production preview:

```sh
npm run build
npx vite preview --host 127.0.0.1 --port 4173
```

## Controls

- **Pixel / ASCII** switches rendering style.
- **Size** always keeps the same label. In Pixel it changes block size (2–12); in ASCII it changes character density (1–10, larger is denser). Each mode remembers its value.
- **Motion** enables shuffled opening lights and ambient animation; reduced-motion settings are respected.
- **English Lights Mode** enables letter clicks in the standalone preview. Native typing, selection, repeated letters, deletion and undo remain synchronized. IME composition temporarily blocks light input.
- **Skin** removes the decorative layer without clearing the message.
- The preview Send button only clears a local demo message. It does not contact Codex or an AI service.

## Build and validate

```sh
npm run check
npm run doctor
```

Tests use Google Chrome via Playwright. `check` builds both the preview and the experimental native module, runs unit tests and browser tests. `doctor` reports native installation blockers and currently exits with code 2. A passing browser fixture is not proof of real Codex installation.

`npm run build:native` creates a self-contained, read-only host integration module. It has explicit mount/unmount methods, shadow-root styles, embedded assets, and detached-editor cleanup. No loader is installed into Codex and no application files are changed. Native letter insertion remains disabled.

## Artwork

The scene assets are derived from a user-provided visual reference. The original photograph and local working artifacts are not included in the public source package. Existing assets are sufficient to run and build the project. Optional regeneration uses Python/Pillow:

```sh
python3 -m pip install -r scripts/requirements.txt
python3 scripts/prepare-assets.py --reference /path/to/reference.jpg --sofa-box 416,674,1251,1028
```

The reference-aware pipeline samples the painted alphabet and sofa. Running the script without a reference generates placeholder ASCII assets instead. No additional rights to the underlying reference artwork or third-party names are granted by publishing this code.

## Remove

Close the preview and stop its server. For the experimental host module, use **Remove skin** or `StrangerSkin.unmount()`. No startup service, native application modification, or persistent editor state is installed.
