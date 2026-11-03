# Playform Studio

Visual game editor for desktop and mobile, with a compact charcoal interface based on the supplied Playform Studio reference.

Run `npm run dev`, then visit http://localhost:3000. Run `npm test` and `npm run build` for checks. No package installation is required.

Implemented features:

- Start screen, project creation wizard, optional asset imports and game brief; either setup step can be skipped independently.
- Seven starter scenes: empty, platformer, rhythm course, top-down adventure, space shooter, coin maze, and runner.
- Selection, drag-and-drop placement, resizing, snapping, zoom, pan, Inspector transforms, layers, duplicate/delete, and undo/redo.
- Rearrangeable docks, draggable dividers, collapse/hide, presets, named layouts, and reset. Layouts persist on the device.
- Quick/Advanced modes, Earth/Moon/Mars/Zero/Custom gravity, static/dynamic/trigger body types, hitboxes, bounce, and friction.
- Touch and game-start visual events for scoring, health, checkpoints, and audio. Basic playable previews with collisions and touch controls.
- Sprite drawing: pencil, eraser, bucket, eyedropper, rectangle, layers, transparency, palettes, import, and PNG export.
- Animation timeline: frames, states, playback, FPS, looping, and onion skinning. Saved animations play on scene objects during testing.
- Sound editor: audio import, waveform, trim, gain, fades, SFX presets/generation, playback, WAV export, and Play Sound events.
- Game-resolution presets/custom sizes, optional scene scaling, aspect-locked object sizes, and bottom-right resize handles.
- Keyboard, mouse, controller buttons/axes, and touch inputs; editable bindings.
- Local project checks with cause, evidence, and review/approval before applying a fix.
- Self-hosted Montserrat fonts, phone layouts, automatic device-local saving, JSON import/export.

Orbit is optional. Local checks and guided help need no model. Website AI can connect to an Ollama endpoint with `ORBIT_OLLAMA_URL` and `ORBIT_MODEL`, or an OpenAI-compatible local llama.cpp endpoint with `ORBIT_LOCAL_URL`. No model is hosted on the public Railway website by default. The Linux desktop edition bundles Qwen2.5-Coder-1.5B-Instruct Q4_K_M and llama.cpp, starts the model on the first question, and needs no Ollama, API key, or additional model download. AI advice can be wrong; it cannot execute arbitrary project changes.

Build the Linux x64 portable desktop edition with `python3 scripts/download-desktop.py` followed by `python3 scripts/package-desktop.py`. Downloads use pinned SHA-256 hashes. The resulting archive includes Electron, the app, the native inference runtime, model, fonts, and licenses. This is an unsigned Linux development package; Windows/macOS/Android installers are not included.

Not yet implemented: 3D editing, multiplayer networking, a full menu designer, prefab system, user-defined functions, audio beat synchronization, production game publishing, and advanced physics constraints. The rhythm preset is a starter course, not a finished rhythm game. Project persistence and preview checkpoints are implemented; a general in-game save/load system remains future work.

Validation: `npm test`, `npm run build`, and `python3 tests/browser-smoke.py`. The browser smoke test uses installed Chromium and covers setup/imports, docks, events, physics, mobile navigation, persistence, sprite/animation editors, inputs, Orbit guidance, audio and resolution. `python3 tests/orbit-smoke.py` tests the downloaded bundled model through the same API.

Projects are stored in browser localStorage. Export backups to protect against browser storage clearing or move work between devices. Serve over HTTPS outside local development so browser secure-context APIs are available.
