# Dota 2 Assistant: Agent Rules

Read this first. Keep changes small, tested, and consistent with the docs linked below.

## Project

Dota 2 coaching/assistant web app. Stack: <!-- TODO: confirm --> React + TypeScript, Tailwind, GSAP, Lenis, WebGL (ShaderGradient), SoundEngine.

Key locations: <!-- TODO: fix paths to match the repo -->

- `src/components/`: UI components
- `src/lib/`: heuristics, data parsing, API clients (business logic lives here, not in components)
- `src/styles/tokens.*` (or Tailwind theme): the only source of design values
- `GLOSSARY.md`: ubiquitous language. Use these terms in code and UI copy
- `docs/adr/`: architectural decisions. Read before changing interfaces
- `.agent/skills/`: engineering skills (see "Workflow")

## Commands

<!-- TODO: replace with the real commands -->

```
install:    npm install
dev:        npm run dev
test:       npm test
typecheck:  npm run typecheck
lint:       npm run lint
build:      npm run build
```

## Definition of Done

Never report a task as finished until all of these pass:

1. `test`, `typecheck`, and `lint` are green (paste the result, don't assume).
2. New behavior has a test. Bug fixes have a regression test that failed first.
3. The invariants below still hold (their checks are in the test suite).
4. No unrelated changes in the diff. No leftover debug code or commented-out blocks.
5. If an interface or architectural decision changed, `docs/adr/` or `GLOSSARY.md` is updated.

## Boundaries

- Never commit secrets. API keys live in environment variables (`GOOGLE_STUDIO_API_KEY`, etc.) and `.env*` stays gitignored.
- Ask before adding a dependency. Prefer what is already installed.
- Do not hand-edit generated files or lockfiles.
- Do not hardcode game data (heroes, items, patch numbers). It comes from the data layer.
- Ask before large refactors or anything touching more than ~5 files.

## Workflow

- **Issues**: GitHub Issues on `xyoko/dota2-assistent` via `gh`. See `docs/agents/issue-tracker.md`.
- **Labels**: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.
- **Domain**: single-context model. See `docs/agents/domain.md`.
- **Git**: one feature per branch, small commits with meaningful messages, commit before any large AI-driven change.
- **`/tdd`**: failing test at a public seam first, then minimal implementation, one vertical slice at a time.
- **`/codebase-design`**: deep modules behind small public interfaces; expose testable seams.
- **`/diagnosing-bugs`**: reproduce, isolate the minimal case, form a hypothesis, instrument, verify the fix.
- **`/code-review`**: two axes, Standards (smells, consistency) and Spec (fidelity to requirements), using a clean subagent.
- **`/improve-codebase-architecture`**: run periodically, not per task.

## Design System

Design values live in the tokens file. Do not invent new colors, radii, shadows, or timings inline; add a token instead.

Direction: dark spatial UI, obsidian glass surfaces, hairline luminous borders, high-contrast monospace metrics, tactile micro-interactions, ambient shader/curve backgrounds behind translucent layers.

Reference values (move these into tokens if they aren't there yet):

- Surfaces: `#07090e`, `rgba(10,13,20,0.85)`
- Borders: `border-white/[0.08]` to `border-white/[0.22]`
- Inner highlight: `inset 0 1px 0 0 rgba(255,255,255,0.12)`
- Press feedback: `active:scale-[0.98]`
- Palette for backgrounds: Dota crimson, obsidian, cyan, amber
- Shared effects: `.specular-card`, `.specular-glint`, `ShaderGradient.tsx`, `DurvesCurves.tsx`

UI rules:

- Structured components (badges, matrices, collapsible drawers), never walls of markdown.
- Telemetry badges (patch version, timings) must come from real data or real measurement, never hardcoded.
- Respect `prefers-reduced-motion`; provide a static fallback for WebGL and heavy animation.
- Sound cues are opt-in and routed through `SoundEngine`.
- Maintain WCAG AA contrast on text.
- Performance budget: <!-- TODO: set numbers, e.g. LCP, JS size, 60fps on mid-range mobile -->

## Invariants (enforced by tests or lint)

| Rule                                                         | Check                                  |
| ------------------------------------------------------------ | -------------------------------------- |
| Hero Arsenal category icon is always `Crown`, never `Shield` | unit test on the component / lint rule |
| Lenis smooth scrolling is active globally                    | test that it initializes at app root   |
| 3D Hero Vault rotates on wheel without scrolling the page    | e2e/interaction test                   |

If you add an invariant here, add its check in the same change.

## Data and Reliability

- One source of truth for game data; document how it is refreshed after each patch.
- All external API calls (OpenDota, Stratz, etc.) handle timeout, rate limiting, and failure with a visible degraded state, not a blank screen.
- Heuristics and data parsing are the core product: unit test them heavily, including bad and empty input.

## Model Routing

Model selection is configured in the tooling, not enforced by this file. Preferences, to be set in tool config:

- Hard work (architecture, multi-file refactors, state redesign): strongest available model, high reasoning effort.
- Lightweight work (file scans, tree mapping, shell commands): the cheap/fast model.

<!-- TODO: verify model IDs against what your tool actually exposes before wiring them into config. -->

## Keeping This File Healthy

If the agent repeats the same mistake, add one line here. If a line never changes behavior, delete it. Put detail in `docs/agents/*`, not here.
