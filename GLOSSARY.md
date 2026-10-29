# Dota 2 Tactical Assistant: Glossary

Canonical language for this codebase. Agents, tests, components, and docs must use these terms consistently. Keep entries short; when a term maps to a component, link the file name only if it is stable.

Sections: **Domain** (what Dota concepts mean here), **UI Surfaces** (named product features), **Avoid** (naming mistakes to prevent). Tooling and model policy live in `GEMINI.md` and `AGENTS.md`, not here. Visual effects live in the design tokens and design docs.

<!-- TODO markers below are facts only the project owner knows. Fill them in; do not guess. -->

---

## Domain

#### Hero

A playable Dota 2 character. The set of heroes comes from the game data layer. Never hardcode a hero count or list in code, tests, or copy.

#### Position

The role a hero plays in a draft, numbered 1 to 5 (1 = Carry, 2 = Mid, 3 = Offlane, 4 = Soft Support, 5 = Hard Support). Used together with a team side (Radiant or Dire) to identify a **Draft Slot**.

#### Draft Slot

One of the 10 positions in a draft: a Position on a team side (for example, Radiant Carry or Dire Mid).

#### Draft Phase

A stage of the pick/ban sequence. A **Pick** adds a hero to a team; a **Ban** removes a hero from the pool.

<!-- TODO: state which game mode(s) are supported (e.g. Captains Mode) and whether phase order is modeled. -->

#### Patch

A versioned Dota 2 game update. All balance-dependent data (matchups, coefficients, item timings) is valid for a specific patch. The patch shown in the UI must come from the data, never from a literal string.

#### Matchup

How one hero performs into another, optionally scoped to a Position or lane.

#### Synergy

How well two allied heroes perform together on the same team.

#### Counter Coefficient

A number describing how well Hero A performs into Hero B.

<!-- TODO: define range (e.g. -1 to +1), direction (does positive favor A?), whether it is position-scoped, and units. -->

Coefficients are stored per patch in the **Matchup Matrix**. They are never computed at runtime from live API calls.

#### Matchup Matrix

The pre-compiled, patch-specific table of Counter Coefficients and Synergy values that the client reads.

<!-- TODO: source of the data (OpenDota, Stratz, manual), how it is regenerated after a patch, where it lives in the repo. -->

#### Deterministic Counter-Drafting

Client-side evaluation of pick/ban synergies, lane advantages, and counters using the Matchup Matrix. Same inputs always produce the same output, with no network call and no LLM. Speed is a performance budget with a test, not a claim in prose.

<!-- TODO: set the budget (e.g. under X ms for a full 10-slot evaluation) and link the test. -->

Do not confuse "deterministic" with "correct": output quality is limited by the freshness and accuracy of the Matchup Matrix.

---

## UI Surfaces

#### Oracle Panel

The structured tactical interface that replaces free-form AI text. Four cards:

1. **Threat Nemesis Matrix**: hard enemy counters, burst/lockdown threat levels, BKB interaction ratings.
2. **Power Spike Windows**: timeline of early, mid, and late-game viability with timing breakpoints (for example, Blink Dagger and BKB windows).
3. **Mandatory Item Blueprint**: core, situational, and counter items with short tactical justification tags.
4. **5v5 Teamfight Protocol**: win condition, initiation sequence, target priority, counter-play directives.

(Previously called "Esports Oracle Cockpit".)

#### Active Focus Mode

A view mode of the 5v5 draft board (`PredictiveDraft5v5`) that isolates the currently targeted Draft Slot and condenses the other nine slots into minimal roster chips to save vertical space.

#### Full Board Mode

The overview mode of the 5v5 draft board showing all 10 Draft Slots across Radiant and Dire.

#### Orbital Hero Vault

The 3D hero showcase widget (`OrbitalHeroVault.tsx`). It lists every Hero from the data layer in three display modes:

- **Dome Mode**: cylindrical carousel with its own wheel scrolling (`data-lenis-prevent`), infinite loop, and auto-orbit.
- **Sphere Mode**: spherical projection (`DomeGallery.tsx`) with 360-degree rotation.
- **Card Deck Mode**: dense card matrix.

The vault must never scroll the page while it handles its own wheel input. It needs a static fallback for reduced motion and weak devices.

#### Mini HUD

The detached floating window (`PictureInPictureHUD.tsx`) that shows build phases, enemy counters, and talent timings above the game, built on the Document Picture-in-Picture API.

<!-- TODO: confirm browser support and define the fallback in unsupported browsers (e.g. an in-page panel or a popup window). -->

---

## Avoid

| Use this                       | Not this                                | Why                                            |
| :----------------------------- | :-------------------------------------- | :--------------------------------------------- |
| Oracle Panel                   | Esports Oracle Cockpit, Cockpit (alone) | "Cockpit" was ambiguous; one name per concept  |
| Active Focus Mode              | Active Focus Cockpit, Collapsed Mode    | Matches the actual mode name                   |
| Full Board Mode                | Full Board (Passive) Mode, Passive Mode | One name                                       |
| Orbital Hero Vault             | Hero Grid, Flat List                    | Names the 3D carousel, not a generic grid      |
| Counter Coefficient            | Counter Score, Counter Rating           | One name for one quantity                      |
| Deterministic Counter-Drafting | Deterministic Heuristics, Chatbot Draft | One name; this is client-side math, not an LLM |
| Position (1 to 5)              | Role, Lane (when you mean Position)     | Lane and Position are different concepts       |

Design rules such as "use `Crown` not `Shield` for the Hero Arsenal" and "no unstructured markdown walls" are invariants and UI rules. They live in `AGENTS.md`, with automated checks where possible.
