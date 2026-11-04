# Coding Conventions

**Analysis Date:** 2026-11-03

## Naming Patterns

**Files:**
- PascalCase for React components: `App.tsx`
- camelCase for utility modules: `bridge-hooks.mjs`
- CSS files: lowercase with dash separators: `index.css`

**Functions:**
- camelCase for function declarations and arrow functions
- Closures use camelCase: `changeWithUndo()`, `evalOwn()`, `evCard()`
- Factory/builder functions prefixed with descriptive verb: `go()`, `pick()`, `chip()`, `pickList()`, `startEvent()`, `createEvent()`
- Single-letter function names used for simple transformers: `tab()`, `pick()`, `go()` (short-lived closures in renderVals)

**Variables:**
- camelCase throughout, including single and multi-letter abbreviations: `cTab`, `dmKey`, `ciHard`, `evFrom`, `pFirst`, `s` (state), `self`
- Abbreviated variable names in large state objects: `ci` = checkin, `ev` = event, `dm` = direct message, `p` = practice, `c` = circle
- Boolean variables prefixed with `is`, `has`, `no`, `on`: `isAngry`, `hasPlans`, `noPlans`, `onbDone`, `seeSteps`, `readOnly`
- State property names directly mapped: component state keys become `s.keyName` locally, then destructured to camelCase (`s.screen` → `screen`)

**Types:**
- No explicit TypeScript interfaces or type aliases found (`@ts-nocheck` at top of App.tsx)
- Objects used as implicit types throughout (data structures like `dmData`, `circleData`, `scripts`)
- Props destructured as plain objects: `{ name, tint, size = 40, onClick }`

## Code Style

**Formatting:**
- Two-space indentation observed in component JSX, four-space in hook script
- No formatter config detected (`.prettierrc` absent)
- Strings use single quotes in most code: `'gaming'`, `'screen'` (double quotes used in JSX content and template literals)
- Object literals inline on single lines when short, multi-line when complex
- Function bodies condensed on single lines when logically simple: `return map[name].indexOf(screen) >= 0 ? 'var(--soft)' : 'transparent'`

**Linting:**
- No `.eslintrc` found
- TypeScript checking disabled at file level: `// @ts-nocheck` at top of `App.tsx`
- No linting rules enforced; code style is informal

## Import Organization

**App.tsx:**
```typescript
import React from 'react';
// Single import, minimal
```

**bridge-hooks.mjs:**
```javascript
// Node built-ins at top
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Constants follow
const ROOT = path.resolve(...);
const PROMPT_DIR = path.join(...);
```

**Path Aliases:**
- None detected; full paths used throughout

## Error Handling

**Patterns Observed:**
- Try-catch used defensively for git operations: `git()` function wraps `execFileSync` in try-catch, returns `null` on failure
- Graceful degradation: functions check for null returns and provide defaults
  - Example: `if (!user) return UNKNOWN_USER;` (never guess on identity)
  - Example: `const payload = null; try { payload = JSON.parse(raw); } catch { }` (silent fallback to null)
- No explicit error objects thrown; process exit codes used for CLI errors
- React component state has no error boundary or error state tracking

**Error Recovery:**
- Retry logic in git operations (implicit timeout: 20s)
- Duplicate detection to prevent repeated logging: `isRecentDuplicate()` checks recent entries by hash and timestamp
- Validation before action: checks user identity before logging prompt, checks for secrets before pushing

## Logging

**Framework:** console (implicit) and file system for structured logging

**Patterns:**
- App.tsx: inline state changes via `setState()` with toast notifications
  - `changeWithUndo()`: logs message to UI toast with 5s timeout
  - `saveQuietly()`: silent notification (1.8s timeout)
  - `notify()`: standard toast (5s timeout)
- bridge-hooks.mjs: file-based append-only log
  - Prompts logged to `AI_PROMPTS/<TeamMember>.md`
  - Timestamps and secret redaction on every entry
  - Hash-based deduplication to skip recent duplicates

**When to Log:**
- Log every user prompt with context (tool, session)
- Log state changes as user actions (RSVP, preferences, messages)
- Log successful git operations implicitly (hook output silence = success)
- Log security issues (blocked push) to stderr only

## Comments

**When to Comment:**
- Sections marked with dividers: `// ---------- Events ----------`
- Complex business logic: `// Small changes (settings, saves) get a short quiet confirmation without Undo`
- Level/state comments: `// ----- Level 3: user types their own reply (rule-based check until the AI API is connected) -----`
- Algorithm explanation: above `isRecentDuplicate()`, above `STRONG_SECRETS` pattern list

**JSDoc/TSDoc:**
- Not used; no type annotations documented

## Function Design

**Size:**
- `renderVals()` in `BridgeBase`: ~500 lines (largest method, complex state composition)
- Most helper functions: 1-10 lines (tight closures, single responsibility)
- Rule: closures defined inline in `renderVals()` capture `self` for `setState()`

**Parameters:**
- Destructuring preferred for component props: `{ name, tint, size = 40, onClick }`
- Default values: `size = 44`, `cur`, `key` pattern for mapping functions
- Arrow functions in arrays map over data: `.map(function (k) { ... })` (function keyword used for clarity in callback chains)

**Return Values:**
- Components return JSX/React elements or null
- Utility functions return objects with computed properties and bound methods
- Functions building UI elements return `{ label, on, bg, fg, pick: function () { ... } }` (state and callbacks)
- No explicit null returns; undefined or empty objects used

## Module Design

**Exports:**
- `App.tsx`: no explicit export (imports only); single component used as default
- `bridge-hooks.mjs`: functions organized by feature, entry point at end:
  ```javascript
  const [command, ...args] = process.argv.slice(2);
  switch (command) {
    case 'log-prompt': logPrompt(args); break;
    case 'guard-push': process.exitCode = guardPush(); break;
  }
  ```
- Helper functions grouped: git utilities, logging helpers, security checks

**Barrel Files:**
- Not applicable; monolithic component structure

---

*Convention analysis: 2026-11-03*
