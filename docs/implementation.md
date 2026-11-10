# Stranger Codex implementation — 2026-11-06

User specification is the implementation plan. Separate standalone Vite preview; no production application modifications. TypeScript modules, precomputed SVG text assets, two bounded timers, native browser editor operations with actual input event reconciliation. Editor text is authoritative. Default English Lights Mode is off. Codex adapter remains read-only until a supported editing bridge and a real-client acceptance record exist.

Phase 1: deterministic Pillow-generated original placeholder scene (three reference images absent). Add mirror/crop/edge/ASCII pipeline for later supplied images. Scene coordinates 1000 × 390; sofa composer-relative at 70% width.
Phase 2–4: semantic lamp buttons, character counts, editor selection preservation, composition guard, inactivity and visibility lifecycle.
Phase 5: unit and Chromium interaction tests, screenshot, actual five-minute idle/two-minute interaction metrics via isolated Chromium DevTools Protocol session. No connection to Codex.
Phase 6: read-only local app metadata and public customization documentation review.
Phase 7: withheld if official mounting/editing APIs or explicit isolated CDP authorization are unavailable. Deliver working preview regardless.

Missing visual references mean precision matching cannot be accepted. Operating-system IME mode cannot be detected; explicit mode plus composition events is the documented boundary.

Update: user located all three references on Desktop (1.jpg, 2.png, 3.png). Reviewed all images; replaced placeholder with mirrored reference-derived sofa and sampled wallpaper. Phase 1 no longer blocked on missing images. Phase 7 remains gated by explicit isolated-client authorization and actual editor compatibility.
