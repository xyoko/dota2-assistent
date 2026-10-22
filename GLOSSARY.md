# Dota 2 Tactical Assistant — Ubiquitous Language Glossary

This glossary establishes the canonical domain language for the Dota 2 Assistant codebase. All agents, tests, components, and documentation must use these terms consistently.

---

### Core Domain Terms

#### Deterministic Counter-Drafting
The client-side mathematical evaluation of pick/ban synergies, lane advantages, and hero counter coefficients. Computed instantaneously (under 0.05ms) using pre-compiled matrix heuristics rather than slow, non-deterministic API queries.

#### Esports Oracle Cockpit
The high-density tactical interface replacing unstructured AI text blocks. Consists of four structured telemetry cards:
1. **Threat Nemesis Matrix**: Identifies hard enemy counters, lethal burst/lockdown threat levels, and BKB interaction ratings.
2. **Power Spike Windows**: Visual timeline of early, mid, and late-game viability with timing breakpoints (e.g. Blink Dagger + BKB windows).
3. **Mandatory Item Blueprint**: Contextual core, situational, and counter-item builds with tactical justification tags.
4. **5v5 Teamfight Protocol**: Win condition summary, initiation sequence, target priority, and counter-play directives.

#### Active Focus Cockpit
A spatial drafting view mode in `PredictiveDraft5v5` that isolates the currently targeted draft slot (e.g., Radiant Carry or Dire Mid), condensing the remaining 9 hero slots into minimal team roster chips to optimize vertical screen real estate.

#### Full Board (Passive) Mode
The macro drafting overview displaying the full 10-hero dedicated board across both Radiant and Dire factions.

#### Orbital Hero Vault
The 3D interactive hero showcase widget (`OrbitalHeroVault.tsx`) featuring:
- **3D Dome Mode**: Cylindrical perspective carousel with its own wheel scrolling (`data-lenis-prevent`), seamless infinite looping across all 124 heroes, and an autonomous 60fps auto-orbit engine.
- **3D Sphere Mode**: Spherical celestial projection (`DomeGallery.tsx`) with 360-degree orbital rotation.
- **Card Deck Mode**: High-density holographic card matrix.

#### Specular Glint Sheen
The dynamic GPU-accelerated light reflection effect (`.specular-card`, `.specular-glint`, `@keyframes specular-sweep`) that sweeps across cards on hover and tilts in 3D parallax with mouse coordinates.

#### Argon Hybrid Orchestration
The dual-tier model delegation policy:
- **Priority Tier (`gemini-4-argon`)**: Reserved for high-horizon architectural reasoning, strategic counter-drafting algorithms, and multi-file refactoring.
- **Utility Tier (`gemini-3.8-flash`)**: Reserved for local token parsing, repo tree mapping, and shell command execution.

#### Picture-in-Picture Mini HUD
The native Document Picture-in-Picture window (`PictureInPictureHUD.tsx`) that detaches and floats essential build phases, enemy counters, and talent timings above Dota 2 on any monitor.

#### Shader Gradient & Durves
The visual atmospheric background stack combining hardware-accelerated WebGL color meshes (`ShaderGradient.tsx`) and generative harmonic mathematical curves (`DurvesCurves.tsx`) with GSAP ambient animation of the official Dota 2 emblem.

---

### Terminology Rules & What to Avoid

| Canonical Term (Use This) | Deprecated / Avoid (Do Not Use) | Rationale |
| :--- | :--- | :--- |
| **Crown Icon** (for Hero Arsenal) | Shield Icon | User explicitly deprecated Shield in favor of Crown |
| **Esports Oracle Cockpit** | AI Slop / Markdown Wall | Unstructured AI text dumps are forbidden |
| **Orbital Hero Vault** | Generic Hero Grid / Flat List | Represents the 3D cylindrical/spherical carousel |
| **Active Focus Mode** | Collapsed Mode | Describes the user's active tactical focus |
| **Deterministic Heuristics** | LLM Hallucinations / Chatbot Draft | Counter computations are client-side mathematical algorithms |
