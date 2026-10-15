# Global Antigravity Orchestration Policy: Argon Priority

## Hybrid Model Delegation Rules (Applies to all projects & conversations)

1. **Argon Priority Enforcement**:
   - Model `gemini-4-argon` is designated as the **Priority Tier** across all projects and conversations.
   - For all high-horizon engineering, architectural reasoning, complex multi-file refactoring, state management redesign, and advanced algorithmic synthesis, ensure requests are dispatched with Argon priority (tag with `[Argon]` or route to `gemini-4-argon`).
   - Use the environment variable `GOOGLE_STUDIO_API_KEY` for authenticating Argon routing calls.

2. **Delegation to Free Tier (Gemini 3.8 Flash)**:
   - Route to Gemini 3.8 Flash (`gemini-3.8-flash`) strictly for lightweight local utilities:
     - File parsing & regex token scans
     - Repository tree mapping
     - Shell process monitoring
     - Local terminal command execution
   - Once local file/terminal context is collected, transition back to Argon for high-level synthesis and code generation.

3. **Subagent Orchestration**:
   - When launching autonomous subagents or background tasks requiring multi-step reasoning, specify high reasoning effort and Argon prioritization.
