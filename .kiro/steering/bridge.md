# Bridge — follow the .claude instructions

This project's rules live in the `.claude/` folder, which is the single source of
truth for every AI tool (Claude Code, Kiro, or any other). Do not duplicate those
rules here — read and follow them directly.

**Read `.claude/skills/bridge/SKILL.md` in full before working**, and treat
`.claude/CLAUDE.md` as the short always-on summary. Part 1 of SKILL.md (team rules)
overrides everything else.

The two files below are included automatically so they are always in context:

#[[file:.claude/CLAUDE.md]]

#[[file:.claude/skills/bridge/SKILL.md]]

## Kiro-specific notes

- You are a non-Claude-Code tool, so identify yourself as **"Kiro"** in anything the
  team rules attribute to a tool (prompt log `--tool`, etc.). Never name the AI tool
  in commit messages or PRs (SKILL.md 1.2).
- Two Kiro hooks in `.kiro/hooks/` mirror the Claude Code hooks in
  `.claude/settings.json`, both calling the same `scripts/hooks/bridge-hooks.mjs`:
  - `bridge-log-prompt` (UserPromptSubmit) → logs each prompt to `AI_PROMPTS/<Name>.md`.
  - `bridge-guard-push` (PreToolUse on `execute_bash`) → blocks unsafe `git push`.
  If the log-prompt hook reports it cannot tell which teammate is typing, **ask which
  teammate** (Tejas, Dhyey, Shreeya, Rishi) and never guess — see SKILL.md 1.1.
