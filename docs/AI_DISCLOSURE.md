# AI assistance and attribution

Item 3 of the [Technical Code Review Checklist](VIEW%20ONLY_Technical%20Code%20Review%20One-Pager_Final.pdf)
requires transparent disclosure of external or generated code and AI assistance.
The following records how AI tools helped build Bridge.

We used AI tools while building Bridge, with a person reviewing every change:

- **Claude (Anthropic):** research summaries, idea write-ups, user-flow drafts, and React code for the prototype, plus the repo tooling (`scripts/hooks/`, `.claude/`). Earlier commits it helped write carry a `Co-Authored-By: Claude` line; newer commits do not, and this section is the record.
- **Figma Make AI:** applied code changes to the Figma Make prototype.
- **Codex (OpenAI):** reviewed the codebase and implemented the production onboarding flow from the exported Figma Make source, including typed components, validation, private contact persistence, and verification. Also implemented the daily check-in and Home from the Make export, with owner-only check-ins and weekly goals, live circle activity, real notifications, and account-isolation checks. Implemented Circles, Events, and private DMs, including server-authorized messaging and blocking, atomic RSVPs, reminders, and live verification. Reviewed and updated the production setup and AI integration documentation against the implementation.

The team chose the partner, the problem, the features and every design decision. Each teammate's prompts are in [AI_PROMPTS/](../AI_PROMPTS/).

