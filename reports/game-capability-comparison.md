# Playform: 36-game capability review

This is a feature-gap assessment, not a claim that these games have been built or fully tested in Playform. It compares representative game designs, not a complete or ranked list of popular games. Names refer to gameplay references; an original game would need its own assets, branding, levels and design.

**Current means the working source build.** Some changes, including the car and configurable 3D input rules, are awaiting final verification/publication. Their presence in source does not mean they are already available on the live site.

## How to read the result

- **Small prototype:** the basic loop can be assembled with existing editor tools. This does not mean a full commercial equivalent.
- **Partial / difficult:** useful foundations exist, but recognizable mechanics require missing systems or substantial manual event work.
- **Major blockers:** central systems are missing. I should explain the proposed additions and wait for approval before implementing them.

No full game on this list is claimed to be reproduced at its original scale, content, networking reliability or visual polish.

## The comparison

| # | Reference | Assessment | What Playform can support now | What is missing or difficult |
|---|---|---|---|---|
| 1 | Super Mario | Small prototype | A single 2D jumping level with platforms, pickups, hazards, checkpoints and a finish event. | Connected levels, enemy behavior presets, power-ups, precise movement tuning, slopes and persistent progress. |
| 2 | Sonic | Partial / difficult | Side-scrolling movement and coin-like pickups. | Momentum-based acceleration, slopes, loops, rolling physics, branching routes and speed-aware cameras. |
| 3 | Hollow Knight | Partial / difficult | A side-view scene, sprites, animation frames, health and projectile events. | Melee hitboxes, knockback, enemy AI, bosses, room transitions, inventory and save/load. |
| 4 | Celeste | Partial / difficult | Jumping, hazards and checkpoints. | A polished 2D dash/climb controller, wall sliding, input buffering, coyote time and connected rooms. The experimental 3D wall kick is not a replacement. |
| 5 | Geometry Dash | Partial / difficult | Continuous running, jumps, repeated obstacles and a metronome. | Audio-clock synchronization, beat-map editing, music positioning, speed portals and alternate movement modes. |
| 6 | Subway Surfers | Small prototype | A 3D endless lane runner with coins, obstacles, jumping, sliding and four-direction swipes. | Reliable procedural obstacle patterns, curved tracks, power-ups, progression, animation blending and a general game-save system. |
| 7 | Minecraft | Major blockers | Small scenes made from box objects. | Editable voxel chunks, terrain generation, runtime block placement, crafting, inventory, world streaming and saved multiplayer worlds. |
| 8 | Roblox | Major blockers | Individual small 2D/3D games and private friend rooms. | A hosted creation platform, extensible scripting, accounts, permissions, moderation, economies, asset distribution and scalable game servers. |
| 9 | Terraria | Major blockers | 2D movement, sprites, basic enemies and pickups. | Editable tile terrain, procedural worlds, mining, crafting, inventory, NPC AI and persistent worlds. |
| 10 | Fortnite | Major blockers | A small 3D arena with character movement and friend-room connections. | 3D gunplay, runtime construction, inventory, teams, battle-royale rules, large maps, authoritative networking and competitive security. |
| 11 | Valorant | Major blockers | First-person movement, arms and simple multiplayer presence. | 3D weapon systems, aiming/hitscan, recoil, abilities, team rounds, server authority, lag compensation and anti-cheat. |
| 12 | Counter-Strike 2 | Major blockers | First-person walking in a shared small scene. | Competitive shooting, equipment purchases, objective rules, rounds, authoritative hit checks and network prediction. |
| 13 | Call of Duty | Major blockers | First-/third-person movement and a basic private room. | Advanced weapons, combat animation, enemies, large levels, match rules, progression and robust online networking. |
| 14 | Overwatch 2 | Major blockers | Characters, health displays and basic room state. | Hero abilities, cooldowns, teams, combat, projectile/hitscan networking, objectives and animation systems. |
| 15 | Burg Tag | Partial / difficult | A limited 3D friend-room tag prototype, first-/third-person views, arms, jump/slide and experimental sprint/wall-kick settings. Configurable E/click rules are in the working build. | Swinging/grappling, polished parkour, reusable ability/power-up rules, complete rounds, custom rigged assets and more robust multiplayer. This is not yet an easy way to reproduce Burg Tag's full feel or visuals. |
| 16 | Among Us | Partial / difficult | A small shared map, simple UI and collectible-style tasks. | Hidden roles, private information, kill/report logic, meetings, voting, task authoring, round state and server-side rule enforcement. |
| 17 | Fall Guys | Partial / difficult | A small obstacle course with characters and a few friends. | Stable player-to-player physics, pushing, ragdolls, round transitions, elimination rules, matchmaking and large lobbies. |
| 18 | Phasmophobia | Major blockers | First-person exploration, sound playback and private co-op foundations. | Interactable item systems, evidence rules, ghost AI, voice features, atmosphere tools, missions and persistence. |
| 19 | Lethal Company | Major blockers | A small shared first-person scene. | Inventory, picking up/carrying objects, enemy AI, procedural interiors, mission/economy rules and persistent progress. |
| 20 | R.E.P.O. | Major blockers | Basic 3D rigid bodies and friend-room movement. | Networked grabbing/ownership, stable co-op object physics, object damage/value, enemies, missions and progression. |
| 21 | Five Nights at Freddy's | Partial / difficult | A small 2D UI-and-timer scare prototype using sounds, counters and show/hide events. | Reusable camera feeds/screens, enemy state machines, door/power systems, branching nights and saves. Many rules would currently require manual event setup. |
| 22 | League of Legends | Major blockers | Basic top-down 2D movement, projectiles and UI. | Unit selection, navigation, team combat, abilities/cooldowns, inventory, AI lanes and authoritative multiplayer. |
| 23 | Dota 2 | Major blockers | Basic top-down scene and UI foundations. | MOBA unit/ability systems, navigation, complex interactions, economy, team rules and competitive networking. |
| 24 | Clash Royale | Major blockers | UI buttons and basic timers. | Card/deck systems, runtime unit spawning, pathfinding, autonomous combat, resource rules and synchronized matches. |
| 25 | Brawl Stars | Partial / difficult | A small top-down movement/shooting prototype. | 3D/polished aiming modes, reusable abilities, destructible cover, teams, matchmaking and authoritative combat. |
| 26 | Rocket League | Partial / difficult | An experimental arcade car and dynamic ball-shaped objects. | Goal detection/rules, ball-focused car physics, boosts, aerial control, tuned impacts and synchronized vehicle/ball ownership. A driveable car alone is not Rocket League support. |
| 27 | Forza Horizon | Major blockers | A small arcade-driving test scene. | Suspension, tire grip, drift handling, terrain/roads, race rules, traffic, streaming, realistic assets/materials and progression. |
| 28 | Mario Kart | Partial / difficult | A basic arcade car on a small track-like scene. | Laps/checkpoints, road tools, AI racers, items, drifting, boosts, race UI and reliable multiplayer races. |
| 29 | EA Sports FC | Major blockers | Moving characters, UI and generic physics objects. | Team AI, sports-specific ball control, animation blending, rules/refereeing, tactics and synchronized matches. |
| 30 | GTA V / Online | Major blockers | Small walking/driving scenes and private-room foundations. | Open-world streaming, traffic/pedestrian AI, missions, combat, vehicle variety, persistence and a large online simulation. |
| 31 | Elden Ring | Major blockers | A small third-person scene with a character. | Combat, dodging, stamina, targeting, enemy/boss AI, inventory/equipment, connected worlds and saves. |
| 32 | Zelda: Tears of the Kingdom | Major blockers | Basic character movement and some rigid-body objects. | Climbing/gliding, object manipulation and constraints, construction, combat, quests, large-world streaming and persistence. |
| 33 | Genshin Impact | Major blockers | Basic 3D exploration, UI and character placeholders. | Character switching, combat/element rules, quests, inventory, world streaming, complex animation and backend progression. |
| 34 | Stardew Valley | Partial / difficult | A top-down 2D map, sprites, counters and simple interactions. | Inventory, farming/growth, day schedules, dialogue, shops, NPC navigation, crafting and saves. These need coherent systems rather than many unrelated counters. |
| 35 | Animal Crossing | Major blockers | Small decorative scenes and character movement. | Persistent real-time world state, NPC schedules/dialogue, furniture placement during play, inventory, economy and social systems. |
| 36 | Needle in a Haystack | Major blockers for the digging simulation | A small first-person search-and-collect scene is plausible; a clickable object can also be approximated in 2D. | Pick/interact raycasts, digging/removing pile contents, efficient instanced scatter, tool upgrades, shared dig state and saves. Millions of individual hay pieces are not supported or performance-tested. Several games have this name; the exact reference still matters. |

## Specific proposed improvements — not approved for implementation

### A. General game events and interactions

**Current difficulty:** 2D has more event types than 3D. Counters alone do not supply inventory, branching game logic or reusable abilities. 3D mouse input is currently an input trigger, not automatically a hit test against the object under the pointer.

**Proposed beginner workflow:** choose **When** (touch, click an object, press a key, timer, counter change), add optional **Only if**, then choose **Do** (play sound, move, damage, spawn, change scene, modify inventory). Reuse named event groups instead of copying rules.

**Would help:** almost every comparison, especially FNAF, Among Us, Brawl Stars and search games.

### B. Character movement and combat

**Current difficulty:** basic jumping and experimental parkour controls are not a complete platformer or combat controller. 2D and 3D need different physics implementations.

**Proposed beginner workflow:** optional movement components for dash, wall slide/kick, climb, grapple/swing, knockback and sprint; combat components for hitboxes, damage, invulnerability and cooldowns. Expose meaningful presets with tunable values and previews.

**Would help:** Celeste, Sonic, Hollow Knight, Burg Tag, Elden Ring and shooters. Full fidelity to those games would still require tuning and original content.

### C. Better 3D assets and visual tools

**Current difficulty:** 3D mainly uses built-in meshes and flat image sprites. Low Poly changes built-in geometry and shading; it does not import arbitrary production assets, rig them or make a scene professionally art-directed automatically.

**Proposed beginner workflow:** import GLB/glTF models and animations, apply material presets/textures, place terrain/roads, scatter repeated props efficiently and choose lighting/effect presets. Preserve advanced control over the result.

**Would help:** Burg Tag-like stylized scenes, the haystack reference, realistic driving scenes and most 3D comparisons.

### D. Connected scenes and in-game saves

**Current difficulty:** title-menu pages are not a general scene system. A 2D title in front of a 3D game works, but switching playable 2D/3D levels and restoring a complete game state are separate missing capabilities.

**Proposed beginner workflow:** a scene list, **Change scene** event and named save slots, with checkboxes for which counters, inventory and world changes are saved.

**Would help:** Mario, Hollow Knight, RPGs, farming games and almost any multi-level game.

### E. Inventory, equipment and construction

**Current difficulty:** a counter named Wood is not an inventory item with an icon, stack size, crafting recipe or saved ownership. Editor placement is not runtime building by the player.

**Proposed beginner workflow:** define items once; use pickup, equip, craft, buy/sell and place actions; bind UI slots to inventories.

**Would help:** Minecraft, Terraria, Stardew Valley, Lethal Company and RPGs.

### F. NPC and team intelligence

**Current difficulty:** showing an enemy sprite is not patrol/chase AI or navigation. Large groups of autonomous characters are not provided.

**Proposed beginner workflow:** patrol/chase/flee presets, navigation regions, simple state graphs and perception settings; later, team/unit behaviors.

**Would help:** action games, horror, racing opponents, sports, MOBAs and strategy games.

### G. Multiplayer game rules and reliability

**Current difficulty:** codes/invites connect players; they do not automatically replicate arbitrary game mechanics. Current friend rooms are small prototypes without competitive anti-cheat, durable sessions, generalized ownership or full prediction/lag compensation.

**Proposed beginner workflow:** choose a room/game mode, define replicated values, assign teams/roles, add rounds/objectives and specify who owns movable objects. The server must validate important actions.

**Would help:** Among Us, Burg Tag, Fall Guys, R.E.P.O., shooters and racing. Large competitive games would remain a major engineering task.

### H. Genre-specific tools

- **Rhythm:** audio-clock timing, music transport and beat maps for Geometry Dash-like games.
- **Racing:** road/track tools, lap rules, checkpoints, AI racers and deeper vehicle physics.
- **Search/digging:** object picking, removable piles, instancing, tool upgrades and synchronized edits.
- **Strategy/sports:** runtime unit spawning, team AI and specialized simulation rules.

## Recommended order to discuss

1. **A: events/interactions**, because other systems need reliable ways to connect actions.
2. **C + D: assets, visual tools, scene flow and saves**, to improve both appearance and complete-game structure.
3. **B + G: movement and multiplayer rules**, especially for the Burg Tag reference.
4. **E + F: inventories and NPC behaviors**, to expand the range of game genres.
5. Genre-specific tools based on the game the user actually wants to make next.

## Approval boundary

This document is an assessment only. No new missing system above is authorized by the comparison itself. Explain the selected proposal's scope and tradeoffs, then wait for the user to say **go** before implementing it. Previously requested work is not evidence that every item in this roadmap has been approved.
