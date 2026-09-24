# 🛡️ AegisForge — Dota 2 Tactical Assistant & Build Engine

A modern, fast, AAA-themed Dota 2 tactical companion designed to help you build heroes properly, adapt item builds, counter enemy lineups, simulate 1v1 matchups, and optimize drafts.

Built with **React 18 + TypeScript + Vite + Tailwind CSS**, compiled to static assets ready for **1-click deployment on Cloudflare Pages**.

---

## ✨ Features

- 🗡️ **Hero Arsenal & Phased Progression**:
  - Full roster with detailed guides for 120+ Dota 2 heroes.
  - Phased item builds: **Starting Items**, **Early Game**, **Core Win-Condition**, **Situational Counter Branches** (vs Heavy Magic, vs Evasion, vs High Regen, vs Saves), **Late Game/Luxury**, and **Neutral Item Tiers (1–5)**.
  - Recommended **Skill Maxing Priority** roadmap.
  - **Interactive Glowing Talent Tree** with tactical justifications at levels 10, 15, 20, and 25.
  - Power spikes timeline (Early / Mid / Late) and laning/teamfight rules.

- ⚔️ **1v1 Matchup Arena & Power Curve Simulator**:
  - Head-to-head duel simulator between any two heroes.
  - **Interactive Game Timeline Slider (0 to 60 min)** showing how advantage swings between laning phase, core item timings, and ultra-late game 6-slot wars.
  - Dynamic advantage gauge and victory conditions for both sides.

- 🧪 **The Secret Shop & Build Lab Sandbox**:
  - Interactive 6-slot inventory builder with live net worth calculation.
  - Real-time stat boosts computed (+Bonus Damage, +Health, +Mana, +Armor).
  - Automatic detection of tactical counters granted by your custom item loadout (e.g. True Strike, Break, Anti-Heal, Hex, Disarm).

- 🔄 **Hero ↔ Item Counter Encyclopedia**:
  - **Which Heroes Counter Which Items**: Deep dive into why BKB fails against Legion/Axe/Void/Pudge, why Ghost Scepter gets deleted by Zeus/Lina, why Linken's gets popped by cheap spam, and why Heart feeds Necrophos/Lifestealer.
  - **Which Items Counter Which Heroes**: Exact counter recipes to shut down PA, Bristleback, Storm Spirit, Windranger, Huskar, Morphling, Sven, and Illusion swarms.

- 🎯 **Interactive 5v5 Draft Studio**:
  - Real-time **Enemy Threat Radar** (Magic Burst %, Physical %, Disables %, Mobility %, Sustain %, Illusions %).
  - **Essential Counter Items Needed** aggregated against enemy picks.
  - **Ranked Counter Hero Recommendations** by role (Carry, Mid, Offlane, Support).

- ⚡ **Item Counter Matrix**:
  - Instant problem-to-solution cheat sheet for Dota mechanics: Invisibility, Passives, Evasion, High Regen, Magic Burst, BKB-Piercing Disables, Slippery Casters, and Illusions.

- 📈 **Meta Tier List & Patch 7.37d Tracker**:
  - Role-based S/A/B tiers with win rates, pick rates, and patch notes.

- 🎨 **AAA Visual & Acoustic Atmosphere**:
  - Adaptive ambient golden ember and mana particle canvas (auto-pauses in background tabs to save battery).
  - Synthesized Web Audio UI sound effects with instant on/off toggle.
  - Attribute neon gems (STR Crimson, AGI Emerald, INT Sapphire, Universal Violet).

---

## ⚡ Performance Optimizations

1. **Route-Level Code Splitting**:
   - Heavy modules (`DraftCounterPicker`, `MatchupArena`, `BuildSandbox`, `HeroItemInteractions`, `HeroBuildView`, `MetaTierList`) are lazy-loaded with `React.lazy()` and `Suspense`.
   - Initial entry JavaScript bundle is reduced from **820 kB down to ~63 kB** (20 kB gzipped), delivering instant sub-100ms First Contentful Paint.
2. **Vendor Chunk Isolation**:
   - React runtime, Lucide icons, and static datasets are isolated into dedicated cacheable chunks (`vendor-react`, `vendor-icons`, `data-heroes`, `data-interactions`).
3. **Cloudflare Edge Optimization**:
   - `public/_headers`: Enforces `Cache-Control: public, max-age=31536000, immutable` for all static assets, ensuring global CDN edge hit ratio.
   - `public/_redirects`: Provides zero-overhead SPA fallback (`/* /index.html 200`).
   - `public/manifest.webmanifest`: PWA-ready for mobile & desktop installation.
4. **Adaptive Hardware Rendering**:
   - `AmbientParticles` detects hardware concurrency and device memory, throttling particles on low-power devices and pausing completely when tabs are hidden.
   - Hero images utilize native `loading="lazy"` and `decoding="async"`.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## ☁️ How to Host on Cloudflare Pages

### Option 1: Direct Deploy via Wrangler CLI (Fastest)

```bash
# 1. Build optimized production files
npm run build

# 2. Deploy directly to Cloudflare Pages
npx wrangler pages deploy dist --project-name dota2-assistant
```

### Option 2: Connect GitHub in Cloudflare Dashboard

1. Push your repository to GitHub.
2. In **Cloudflare Dashboard** ➔ **Workers & Pages** ➔ **Create application** ➔ **Pages** ➔ **Connect to Git**.
3. Set build configuration:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
4. Click **Save and Deploy**. Cloudflare automatically distributes your app across 300+ edge locations!

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom Dota 2 theme tokens & glowing gradients
- **Icons**: Lucide Icons
- **Storage**: Browser LocalStorage for persistent notes & drafts
- **Hosting**: Cloudflare Pages / Workers
