# 0002. Deterministic Client-Side Draft Engine

Date: 2026-10-16
Status: Accepted

## Context

Competitive Dota 2 drafts operate within strict 30-second timers. Network round-trips to remote cloud LLMs are too slow, non-deterministic, and prone to hallucinations about patch balances (e.g., outdated talent trees or obsolete shard abilities).

## Decision

All core counter-drafting, lane synergy calculations, and hero rankings run 100% client-side via deterministic matrix heuristics (`src/features/predictive-draft/`). Algorithms execute in under 0.05ms in the V8 runtime using compiled Patch 7.37d telemetry.

LLM inference (via `geminiService.ts` / Argon) is used exclusively as a post-calculation strategic commentary layer rendered inside the structured **Esports Oracle Cockpit**, rather than the drafting decision engine itself.

## Consequences

- Zero drafting latency (instant calculation on every pick/ban click).
- 100% offline and privacy-first draft assistance.
- Reliable, patch-accurate strategic telemetry.
