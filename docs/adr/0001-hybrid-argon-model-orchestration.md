# 0001. Hybrid Argon Model Orchestration

Date: 2026-10-15
Status: Accepted

## Context

The Dota 2 Assistant requires both ultra-fast sub-millisecond local computations and deep, high-horizon strategic reasoning (5v5 counter-drafting, macro game state, multi-file code refactors). Using an expensive large model for routine token scans or terminal commands introduces unnecessary cost and latency, while using lightweight models for complex tactical synthesis produces low-quality "AI slop".

## Decision

We enforce a two-tier hybrid orchestration architecture:
1. **Argon Priority Tier (`gemini-4-argon`)**: Designated as the priority tier for architectural reasoning, algorithmic synthesis, and multi-step tactical advice. Authenticated via `GOOGLE_STUDIO_API_KEY`.
2. **Free Utility Tier (`gemini-3.8-flash`)**: Strictly isolated to lightweight local routines (file parsing, regex token scans, repository mapping, terminal monitoring).

All agent prompts and subagent spawns requiring multi-step reasoning must prioritize Argon.

## Consequences

- High-quality, deterministic strategic advice without hallucination.
- Zero latency overhead for routine local developer utilities.
- Strict token efficiency and controlled API consumption.
