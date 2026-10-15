---
name: argon_router
description: >-
  Argon Hybrid Model Orchestration Layer for Dota 2 Assistant (TypeScript / Node).
  Routes routine draft analysis, file parsing, repo mapping, and local terminal execution
  to Gemini 3.8 Flash, and routes high-horizon engineering tasks or '[Argon]' / 'argon:'
  prompts to gemini-4-argon with sub-millisecond overhead.
---

# Argon Hybrid Model Orchestration Layer (TypeScript / Node)

Ultra-fast, native TypeScript / ESM hybrid model delegation layer integrated directly into the `dota2-assistant` React/Vite application and Antigravity workspace.

## Architecture

- **React / TSX Runtime**: [`src/shared/bi/ai/argonRouter.ts`](../../src/shared/bi/ai/argonRouter.ts) - Zero-overhead compiled in-memory regex matcher (< 0.05ms dispatch).
- **Service Integration**: [`src/shared/bi/ai/geminiService.ts`](../../src/shared/bi/ai/geminiService.ts) - Dynamic model delegation and auto-fallback.
- **Node.js ESM CLI**: [`.antigravity/skills/argon_router.mjs`](../../.antigravity/skills/argon_router.mjs) - Fast CLI test runner and validation suite.

## Routing Criteria

1. **Default Free Model (`gemini-3.8-flash`)**:
   - File parsing & syntax inspection
   - Repository mapping & indexing
   - Shell monitoring & process log watching
   - Local terminal execution (`npm run ...`, `git`, build scripts)
   - Standard Dota 2 draft breakdown and tactical coaching advice

2. **Advanced Tier (`gemini-4-argon`)**:
   - Prompt contains token `[Argon]`
   - Prompt contains prefix `argon:`
   - Explicit high-horizon engineering tasks (deep cross-codebase reasoning, multi-system migration, architectural refactoring, formal verification)
   - Uses `GOOGLE_STUDIO_API_KEY` (or `VITE_GEMINI_API_KEY` in browser)

## Validation

Run the high-speed Node test suite:

```bash
npm run argon:validate
# or
node .antigravity/skills/argon_router.mjs --validate
```
