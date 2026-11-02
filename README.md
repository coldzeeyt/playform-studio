# Playform Studio

First milestone: responsive title/start screen with project creation, templates, recent projects, search, deletion, JSON import/export, device-local persistence, preferences, and a basic scene arrangement editor.

Run `npm run dev`, then visit http://localhost:3000. Run `npm test` and `npm run build` for checks. No package installation is required.

The scene editor supports adding, selecting, dragging, grid snapping, zooming, editing properties, deleting, and undo/redo. Phone layouts provide collapsible Objects and Inspector panels and touch dragging.

This is an incremental foundation. Gameplay runtime, 3D, docking, sprite/animation editors, visual events, input mapping, multiplayer, and AI integration remain future milestones. The AI preference is stored, but no AI provider is connected. All current features work with AI disabled.

Projects are stored in browser localStorage. Export backups to protect against browser storage clearing or move work between devices. Serve over HTTPS outside local development so browser secure-context APIs are available.
