# Project Rules

@./AGENTS.md
@./GLOSSARY.md

## Model preferences (actual routing is set in tool config)

- Architecture, multi-file refactors, state redesign: strongest model, high reasoning effort.
- File scans, tree mapping, shell commands: fast/cheap model, then return to the strong model for synthesis.
- Subagents doing multi-step reasoning: high reasoning effort.

## Auth

- Any script that calls Gemini reads `qwerty` from the environment. Never hardcode or print it.

## Pointers

- Architectural decisions: `docs/adr/`
