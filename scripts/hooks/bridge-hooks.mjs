#!/usr/bin/env node
// Claude Code hooks for the team rules in .claude/skills/bridge/SKILL.md (Part 1), wired up in .claude/settings.json.
//   log-prompt  (UserPromptSubmit) append the user's prompt to AI_PROMPTS/<Name>.md; other AI tools run it by hand
//   guard-push  (PreToolUse on Bash) block `git push` when behind the remote, force-pushing main, or pushing secrets
// Node built-ins only, so there is nothing to install.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PROMPT_DIR = path.join(ROOT, 'AI_PROMPTS');

// A prompt is filed under the first member that matches: --user flag or BRIDGE_USER, then git user.email,
// then the first word of git user.name.
const TEAM = [
  { name: 'Tejas', emails: ['tejasshah4440@gmail.com', 'tshah44@asu.edu'] },
  { name: 'Dhyey', emails: ['dpate408@asu.edu'] },
  { name: 'Shreeya', emails: ['sbohra2@asu.edu', 'shreeyabohra09@gmail.com'] },
  { name: 'Rishi', emails: ['rkatari6@asu.edu'] },
];

// Strong patterns: real credentials with little chance of false positives (used for redaction and the push scan).
const STRONG_SECRETS = [
  [/\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g, 'aws-access-key'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?(?:-----END [A-Z ]*PRIVATE KEY-----|$)/g, 'private-key'],
  [/\bgh[pousr]_[A-Za-z0-9]{36,}\b|\bgithub_pat_[A-Za-z0-9_]{20,}\b/g, 'github-token'],
  [/\bsk-[A-Za-z0-9_-]{20,}\b/g, 'api-key'],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g, 'slack-token'],
  [/\bBearer\s+[A-Za-z0-9._~+/-]{20,}=*/g, 'bearer-token'],
];
// Loose pattern ("password = hunter2hunter2"): redaction only, where a false positive is harmless.
const LOOSE_SECRET = /\b(aws_secret_access_key|secret|password|passwd|token|api[_-]?key)\b(\s*[:=]\s*)(["']?)[^\s"']{8,}\3/gi;

// ---------- helpers ----------

function git(args, opts = {}) {
  try {
    return execFileSync('git', args, {
      cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 20000, ...opts,
    }).trim();
  } catch {
    return null; // null = the git command failed (offline, no upstream...); '' = it worked and printed nothing
  }
}

function readStdin() {
  if (process.stdin.isTTY) return '';
  try { return fs.readFileSync(0, 'utf8'); } catch { return ''; }
}

function parseFlags(args) {
  const get = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
  return { tool: get('tool'), user: get('user') };
}

function resolveUser(explicit) {
  const wanted = (explicit || process.env.BRIDGE_USER || '').trim().toLowerCase();
  if (wanted) return TEAM.find((m) => m.name.toLowerCase() === wanted)?.name ?? null;
  const email = (git(['config', 'user.email']) || '').toLowerCase();
  const byEmail = TEAM.find((m) => m.emails.includes(email));
  if (byEmail) return byEmail.name;
  const firstNames = (git(['config', 'user.name']) || '').toLowerCase().split(/\s+/);
  return TEAM.find((m) => firstNames.includes(m.name.toLowerCase()))?.name ?? null;
}

function redact(text) {
  let count = 0;
  let out = text;
  for (const [re, label] of STRONG_SECRETS) out = out.replace(re, () => { count++; return `[REDACTED:${label}]`; });
  out = out.replace(LOOSE_SECRET, (_m, key, sep) => { count++; return `${key}${sep}[REDACTED:secret]`; });
  return { text: out, count };
}

// ---------- log-prompt ----------

// Shown to the AI (and the user) when we cannot tell who is typing. Nothing is logged in that case.
const UNKNOWN_USER = 'Bridge could not tell which teammate this is, so this prompt was NOT logged. '
  + 'Ask the user which teammate they are (Tejas, Dhyey, Shreeya or Rishi); never guess. Then log it with: '
  + 'node scripts/hooks/bridge-hooks.mjs log-prompt --tool "<tool>" --user <Name>, the user\'s message on stdin. '
  + 'To stop this question for good: git config user.email <team email>, or set BRIDGE_USER=<Name>.';

function logPrompt(args) {
  const { tool = 'Unknown AI tool', user: userFlag } = parseFlags(args);
  let warning = '';
  try {
    const raw = readStdin();
    let payload = null;
    try { payload = JSON.parse(raw); } catch { /* not JSON: other tools pipe the prompt as plain text */ }
    const isJson = payload && typeof payload === 'object' && !Array.isArray(payload);
    const prompt = String(isJson ? (payload.prompt ?? payload.text ?? payload.user_message ?? '') : raw).trim();
    if (prompt) {
      const session = isJson ? String(payload.session_id || payload.conversation_id || '') : '';
      warning = appendEntry({ prompt, tool, session, userFlag });
    }
  } catch (err) {
    warning = `Bridge prompt log failed: ${err.message}`; // a logging problem must never block anyone from working
  }
  respond(warning);
}

function appendEntry({ prompt, tool, session, userFlag }) {
  const user = resolveUser(userFlag);
  if (!user) return UNKNOWN_USER; // never guess, and never file a prompt under nobody
  const file = path.join(PROMPT_DIR, `${user}.md`);
  fs.mkdirSync(PROMPT_DIR, { recursive: true });
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) fs.writeFileSync(file, logHeader(user));

  const { text, count } = redact(prompt);
  const hash = createHash('sha1').update(text).digest('hex').slice(0, 12);
  const now = Date.now();
  if (isRecentDuplicate(file, hash, now)) return ''; // the same prompt was just logged (hook + manual)

  const stamp = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Phoenix', dateStyle: 'short', timeStyle: 'short' }).format(now);
  const longestTicks = Math.max(0, ...(text.match(/`+/g) || []).map((t) => t.length));
  const fence = '`'.repeat(Math.max(3, longestTicks + 1)); // longer than any fence inside the prompt
  const heading = [`### ${stamp} MST`, tool, session && `session ${session.slice(0, 8)}`, count && `${count} secret(s) redacted`]
    .filter(Boolean).join(' · ');
  fs.appendFileSync(file, `${heading}\n<!-- sha:${hash} ts:${now} -->\n${fence}text\n${text}\n${fence}\n\n`);
  return '';
}

function logHeader(user) {
  return `# Prompt log: ${user}\n\n`
    + 'Every prompt sent to an AI tool for Bridge, oldest first. Written by `scripts/hooks/bridge-hooks.mjs` '
    + '(see `.claude/skills/bridge/SKILL.md`). Append-only; secrets are redacted. Commit this file with your work.\n\n';
}

function isRecentDuplicate(file, hash, now) {
  const size = fs.statSync(file).size;
  const fd = fs.openSync(file, 'r');
  try {
    const len = Math.min(size, 30000);
    const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, size - len);
    for (const m of buf.toString('utf8').matchAll(/<!-- sha:([0-9a-f]{12}) ts:(\d+) -->/g)) {
      if (m[1] === hash && now - Number(m[2]) < 120000) return true;
    }
    return false;
  } finally {
    fs.closeSync(fd);
  }
}

// Claude Code shows `systemMessage` to the user and passes `additionalContext` to the AI, which is how the AI
// learns it must ask who is typing. Nothing is printed when all is well.
function respond(warning) {
  if (!warning) return;
  process.stdout.write(JSON.stringify({
    systemMessage: warning,
    hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: warning },
  }));
}

// ---------- guard-push ----------

function upstreamInfo() {
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  if (!branch || branch === 'HEAD') return { branch: null, upstream: null };
  const tracked = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  if (tracked) return { branch, upstream: tracked };
  const sameName = git(['rev-parse', '--verify', '--quiet', `refs/remotes/origin/${branch}`]);
  return { branch, upstream: sameName ? `origin/${branch}` : null };
}

// Commits the remote has that this branch does not.
function commitsBehind() {
  git(['fetch', '--quiet', 'origin']);
  const info = upstreamInfo();
  if (!info.upstream) return { ...info, behind: 0 };
  return { ...info, behind: Number(git(['rev-list', '--count', `HEAD..${info.upstream}`]) || 0) };
}

// Credentials and .env files in the commits about to be pushed.
function scanOutgoing(base) {
  const problems = [];
  const names = git(['diff', '--name-only', `${base}...HEAD`]) || '';
  for (const name of names.split('\n').filter(Boolean)) {
    if (/(^|\/)\.env(\.|$)/.test(name) && !name.endsWith('.example')) problems.push(`${name} (environment file)`);
  }
  const diff = git(['diff', `${base}...HEAD`, '-U0', '--no-color'], { maxBuffer: 64 * 1024 * 1024 }) || '';
  let file = '?';
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ ')) { file = line.slice(6); continue; }
    if (!line.startsWith('+')) continue;
    for (const [re, label] of STRONG_SECRETS) {
      re.lastIndex = 0;
      if (re.test(line)) problems.push(`${file}: looks like a ${label}`);
    }
  }
  return [...new Set(problems)];
}

// Exit code 2 blocks the command and feeds stderr back to Claude.
function guardPush() {
  let payload;
  try { payload = JSON.parse(readStdin()); } catch { return 0; }
  const command = payload?.tool_input?.command || '';
  const segments = command.split(/&&|\|\||;|\||\n/).map((s) => s.trim());
  const gitCmd = (sub) => new RegExp(`^(?:\\S*/)?git(?:\\s+-[cC]\\s+\\S+|\\s+-\\S+)*\\s+${sub}(?:\\s|$)`);
  const pushIdx = segments.findIndex((s) => gitCmd('push').test(s));
  if (pushIdx < 0) return 0;

  const block = (message) => { process.stderr.write(`Push blocked: ${message}\n`); return 2; };
  const push = segments[pushIdx];
  const forced = /\s(-f|--force|--force-with-lease\S*)(\s|$)/.test(push);
  if (forced && (/\b(main|master)\b/.test(push) || ['main', 'master'].includes(upstreamInfo().branch))) {
    return block('never force-push main. Rebase your own branch and use --force-with-lease there.');
  }

  // `git pull --rebase && git push` in one command is the approved flow, so skip the behind check for it.
  const syncedEarlier = segments.slice(0, pushIdx).some((s) => gitCmd('(?:pull|rebase|merge)').test(s));
  const status = commitsBehind();
  if (!syncedEarlier && status.behind > 0) {
    return block(`${status.branch} is ${status.behind} commit(s) behind ${status.upstream}.\n`
      + 'Pull first, re-run the typecheck/tests, then push: git pull --rebase --autostash && git push');
  }

  const base = status.upstream || (git(['rev-parse', '--verify', '--quiet', 'origin/main']) ? 'origin/main' : null);
  const problems = base ? scanOutgoing(base) : [];
  if (problems.length) {
    return block(`possible secrets in the commits you are pushing:\n  - ${problems.join('\n  - ')}\n`
      + 'Remove them (and rotate the credential if it was real), then re-commit. Never commit keys or .env files.');
  }
  return 0;
}

// ---------- entry point ----------

const [command, ...args] = process.argv.slice(2);
switch (command) {
  case 'log-prompt': logPrompt(args); break;
  case 'guard-push': process.exitCode = guardPush(); break;
  default:
    process.stderr.write('usage: bridge-hooks.mjs <log-prompt [--tool NAME] [--user NAME] | guard-push>\n');
    process.exitCode = 1;
}
