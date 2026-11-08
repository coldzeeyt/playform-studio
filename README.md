# Playform Studio

Visual game editor for desktop and mobile, with a compact charcoal interface based on the supplied Playform Studio reference.

Run `npm start`, then visit http://localhost:3000. Run `npm test` and `npm run build` for checks. No package installation is required.

Implemented features:

- Start screen, project creation wizard, optional asset imports and game brief; either setup step can be skipped independently.
- Starter scenes: empty, platformer, rhythm course, top-down adventure, space shooter, coin maze, and runner.
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

3D is available as a separate scene dimension. Choose **3D playground** or **3D lane runner** on the start screen. Three.js 0.170.0 renders locally and Rapier 0.17.3 provides rigid bodies, capsule character collisions, stepping, ground detection, gravity, and sensor pickups. The 3D studio supports ray selection, drag-and-drop objects, move/rotate/scale gizmos, snapping, transform/physics inspection, undo/redo, camera presets, procedural low-poly characters, and idle/walk/run/jump/slide/wave/clap animations. Three-lane running has smooth lane changes, looping obstacles/coins, jump, slide, keyboard controls, actual touch swipes, and editable swipe rules. Requires WebGL2; Imported rigged models and a general 3D event graph are not included yet.

Game UI works in 2D and 3D: drag labels, variable counters, health bars and clickable buttons; change colors, size and text; bind variables and jump/slide/lane/restart or variable actions. Display-only elements pass clicks through. Layout uses percentages to fit phones. Game descriptions generate local suggestions for running, lanes, jumping, counters and swipe mappings. The review dialog applies only selected suggestions after explicit approval; skipping setup bypasses suggestions.

The eight indie examples are playable and editable. 2D multiplayer uses room codes and invitation links with position, collectible and gear synchronization. Game title screens have page links, font selection and presets. Windows game export packages an Electron x64 portable EXE and bundled game assets; it needs no Node installation. Windows execution must be validated on a Windows machine. Both game dimensions export with their local dependencies; AI is not needed to run an exported game.

Remaining work includes a prefab system, user-defined functions, general in-game save/load, production rollback/security for hosted multiplayer, advanced physics constraints, imported 3D animation rigs and a full 3D event graph. The rhythm starter runs continuously with a metronome; it is not an audio-analysis tool.

Validation: `npm test`, `npm run build`, and `python3 tests/browser-smoke.py`. The browser smoke test uses installed Chromium and covers setup/imports, docks, events, physics, mobile navigation, persistence, sprite/animation editors, inputs, Orbit guidance, audio and resolution. `python3 tests/creation-tools-qa.py` checks 3D WebGL/physics, all four actual phone swipes, setup approval, UI binding and persistence. `python3 tests/indie-games-qa.py` completes and restarts all eight example games. `python3 tests/orbit-smoke.py` tests the downloaded bundled model through the same API.

Projects are stored in browser localStorage. Export backups to protect against browser storage clearing or move work between devices. Serve over HTTPS outside local development so browser secure-context APIs are available.

Third-party 3D dependencies are self-hosted in `dist/vendor/`. Three.js and its controls use MIT; Rapier uses Apache-2.0. Licenses are packaged alongside the modules. Rapier compatibility includes its WebAssembly in the module, with no additional runtime download.

Backgrounds & Style is available from the 2D canvas toolbar and 3D toolbar. In 2D, layer clouds, mountains, trees, city silhouettes, stars, and imported transparent PNG/JPEG/WebP sprites behind gameplay. Layers support drag placement, order, visibility, opacity, repeating, camera movement presets and optional drift. Background layers never collide with the player. Five scene looks coordinate sky/scenery colors. In 3D, the Low Poly/Smooth choices change actual primitive and character geometry plus material shading, with Chunky/Balanced/Fine detail, soft shadows and distance mist. Per-object overrides are in the Inspector. Trees, rocks and camera-facing image sprites can be added from the library. Presets preview immediately and cancel restores the saved appearance; applied settings persist and export. Imported arbitrary mesh reduction is not included.

`python3 tests/looks-qa.py` exercises 2D imports/layers, 3D geometry changes, preview/cancel, scenery, billboard import and phone controls. `tests/scene-style.test.mjs` verifies repeat/parallax math, validation and reduced low-poly geometry.

Button usability: action pickers use plain labels, hide unrelated parameters, and disable edits during gameplay previews. Undo/redo, sprite layers and sound Stop reflect their available state. The UI builder can create named counters without leaving the dialog. Project backups and playable Windows exports have distinct labels; 3D title editors disable unavailable online rooms. `python3 tests/buttons-qa.py` checks these states and actions in both editors.

Simple navigation is the default in both editors: Scene, Add, Properties and Events show one panel at a time, with a large canvas and one Play/Stop control. Project, Game and Tools menus group backups/exports, UI/title/backgrounds, and other tools. Tools → Advanced view restores the full workspace; the choice persists on the device. Recent projects appear first on the home screen; example games are expandable or available under Examples. `python3 tests/navigation-qa.py` verifies simple navigation, editing, play, view switching and phone layouts for 2D and 3D. Existing detailed-editor QA uses Advanced view.

First-person and third-person follow are available in the 3D camera selector (Simple view: Tools → Camera view). First person has mouse/drag look, touch movement controls and optional camera-attached arms. Character parkour options currently include sprint, slide and wall kicks; a full Burg Tag movement set such as swinging is not complete. 3D friend rooms support invite links, room codes, shared collectibles, remote characters and a basic server-checked tag mode. This is a small-room prototype, without competitive anti-cheat or durable room sessions. The audio workspace starts empty, with import/preview/edit and optional sound creation.

Feedback is accessible from home, Tools and `/feedback`. Reports are stored in a synced JSONL file on the Railway volume mounted at `/data`; project files are not attached. `tests/first-person-feedback-qa.py` checks first-person controls and persisted reports; `tests/multiplayer-3d-qa.py` checks two-player 3D room joining and tag transfer.

A captioned recording of actual project creation, objects, art, UI, audio events, playtesting and export is generated by `python3 scripts/record-walkthrough.py` in `releases/Playform-Studio-walkthrough.webm`; MP4 is encoded with ffmpeg. Video and game-export artifacts are not committed to source control.

Shared events are being added as a common 2D/3D When → Only if → Do builder, including timers, key/mouse input, object picking, guards, action sequences and reusable groups. Project backups preserve these data-driven rules. Browser tests cover guarded timers/keys, alpha-aware 2D sprite clicks and occluded 3D raycasts.

Shared Railway hosting is limited to the first project per signed-in account, including shared multiplayer and Windows build requests. Local editing and solo previews remain unlimited. Further projects need a compatible creator-owned server configured under Project → Server & account. The allowance is stored on the server, survives restarts, and is not a browser-only flag. This is a per-login limit; it is not proof that one person cannot create multiple accounts. Shared rooms also have occupancy and lifetime limits. Personal-server source is downloadable as `dist/playform-server-kit.zip`.

Working changes include an optional title-screen switch, arcade-car object preset, key/mouse input mappings, and a home screen without the pre-made game gallery. Remaining roadmap systems are documented in `reports/game-capability-comparison.md`; they are not all implemented.
