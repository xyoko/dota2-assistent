# Global Antigravity Orchestration Policy: Argon Priority & Engineering Standards

This document establishes the global operating rules, skill integrations, model routing policies, and UI/UX design intelligence for all AI agents working on the Dota 2 Assistant.

---

## 1. Hybrid Model Delegation Rules (Argon Priority Enforcement)

1. **Argon Priority Enforcement**:
   - Model `gemini-4-argon` is designated as the **Priority Tier** across all projects and conversations.
   - For all high-horizon engineering, architectural reasoning, complex multi-file refactoring, state management redesign, and advanced algorithmic synthesis, ensure requests are dispatched with Argon priority (tag with `[Argon]` or route to `gemini-4-argon`).
   - Authenticate with the environment variable `GOOGLE_STUDIO_API_KEY`.

2. **Delegation to Free Utility Tier (`gemini-3.8-flash`)**:
   - Route to Gemini 3.8 Flash (`gemini-3.8-flash`) strictly for lightweight local utilities:
     - File parsing & regex token scans
     - Repository tree mapping
     - Shell process monitoring
     - Local terminal command execution
   - Once local file/terminal context is collected, transition back to Argon for high-level synthesis and code generation.

3. **Subagent Orchestration**:
   - When launching autonomous subagents or background tasks requiring multi-step reasoning, specify high reasoning effort and Argon prioritization.

---

## 2. Agent Skills Integration (Matt Pocock Skills)

This repository incorporates Matt Pocock's engineering and productivity skills (`mattpocock/skills`) located in `.agent/skills/`.

### Issue tracker
GitHub Issues on `xyoko/dota2-assistent` using `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels
Canonical five-role triage labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs
Single-context domain model. Read `GLOSSARY.md` for ubiquitous language and `docs/adr/` for architectural decision records before designing or modifying interfaces. See `docs/agents/domain.md`.

### Engineering Discipline
- **TDD Loop (`/tdd`)**: Write failing tests at public seams before implementation. Vertical slices (one test → one minimal implementation → repeat) over speculative bulk testing.
- **Deep Modules & Seams (`/codebase-design`)**: Place functionality behind minimal public interfaces. Hide implementation complexity; expose clean, testable seams.
- **Systematic Debugging (`/diagnosing-bugs`)**: Build a reproducing feedback loop → isolate minimal case → formulate testable hypothesis → instrument → verify fix.
- **Two-Axis Review (`/code-review`)**: Evaluate code on **Standards** (Fowler smells, consistency) and **Spec** (fidelity to requirements) using clean subagents.
- **Architectural Health (`/improve-codebase-architecture`)**: Periodically survey codebase for deepening opportunities and modular integrity.

---

## 3. UI/UX Design System & Spatial Aesthetic Directives

All visual components must synthesize the following high-craft design philosophies:

1. **Watermelon UI**:
   - High tactile feedback: Micro-spring presses (`active:scale-[0.98]`), responsive hover states, crisp pill tags, segmented sliders, and delightful sound cues via `SoundEngine`.

2. **Skipper.com**:
   - Dark spatial layouts with elevated obsidian glass surfaces (`#07090e`, `rgba(10,13,20,0.85)`), hairline luminous borders (`border-white/[0.08]` to `border-white/[0.22]`), high-contrast monospace metrics, and ambient radial glow.

3. **Manus.im**:
   - Autonomous AI cockpit aesthetic: Dense telemetry badges (`Patch 7.37d`, `0.04ms Heuristics`), live pulsing status orbs, clean collapsible drawers (e.g. Active Focus vs Full Board), and structured coaching matrices. Zero unstructured "AI slop" or walls of markdown.

4. **Shader Gradient**:
   - Hardware-accelerated WebGL color meshes (`ShaderGradient.tsx`) blending deep Dota crimson, obsidian, ethereal cyan, and radiant amber behind translucent UI layers.

5. **Dark.design**:
   - Best-in-class optical contrast ratios, deep pitch blacks with layered elevation, inner border highlights (`box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.12)`), and GPU-accelerated specular light sheen (`.specular-card`, `.specular-glint`).

6. **Durves.com**:
   - Generative mathematical spline curves (`DurvesCurves.tsx`) flowing organically behind sections and harmonizing with the GSAP ambient animated Dota 2 centerpiece.

### Invariant Rules
- **Category Icons**: The Hero Arsenal must ALWAYS use the `Crown` icon. Never use `Shield`.
- **Global Scrolling**: Lenis smooth scrolling must remain active globally, while the 3D Hero Vault maintains isolated wheel rotation without moving the page scrollbar.
