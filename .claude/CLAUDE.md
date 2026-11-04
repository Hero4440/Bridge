# Bridge: AI instructions

Bridge (Preview. Practice. Go.), Team Ctrl Alt Elite, partner First Place AZ. **Read `.claude/skills/bridge/SKILL.md` before working.** Always:

1. **Log every user prompt** to `AI_PROMPTS/<Name>.md`. Claude Code does it automatically via a hook. Any other AI runs `node scripts/hooks/bridge-hooks.mjs log-prompt --tool "<tool>"` with the user's message on stdin before replying.
2. **Pull before every push:** `git pull --rebase --autostash && git push`. Never force-push `main`, never `--no-verify`. Commit messages and PRs never mention Claude or any AI tool (no `Co-Authored-By`);
3. **Build like production.** Real Cognito, DynamoDB, Lambda and Bedrock. Nothing mocked.
4. **Follow the AWS conventions** (SKILL.md 1.4). No secrets or real participant data in the repo.
