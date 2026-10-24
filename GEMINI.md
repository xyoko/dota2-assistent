# Project Rules

@./AGENTS.md
@./GLOSSARY.md

## Model preferences (actual routing is set in tool config)

- Architecture, multi-file refactors, state redesign: strongest model, high reasoning effort.
- File scans, tree mapping, shell commands: fast/cheap model, then return to the strong model for synthesis.
- Subagents doing multi-step reasoning: high reasoning effort.

## Auth

- Any script that calls Gemini reads `AQ.Ab8RN6K4YI-zW8LO0chl9UC_lWLTb2GmJqp9PvS3Xr_JKZ8Giw` from the environment. Never hardcode or print it.

## Pointers

- Architectural decisions: `docs/adr/`
