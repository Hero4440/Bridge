---
phase: 01-foundation-authentication
plan: 01
subsystem: infra
tags: [amplify-gen2, vite, react, typescript, vitest]
requires: []
provides:
  - app/ production project root (Vite React-TS + Amplify Gen 2 skeleton)
  - strict TypeScript + skipLibCheck (TS2590 mitigation)
  - amplify_outputs/.env gitignored
  - single-region config constant (us-east-1)
  - Vitest runner for Wave-2 unit tests
affects: [02-auth, 03-data, 04-backend-wiring, 05-frontend-auth]
tech-stack:
  added: [aws-amplify@6.22, "@aws-amplify/backend@1.25", aws-cdk-lib@2.268, zod@3.25, vitest@5.1, "@types/aws-lambda@8.10"]
  patterns: [app/ as build root separate from figma-make prototype]
key-files:
  created: [app/amplify/shared/config.ts, app/vitest.config.ts, app/amplify/backend.ts, app/amplify/auth/resource.ts, app/amplify/data/resource.ts]
  modified: [app/tsconfig.app.json, app/tsconfig.node.json, app/.gitignore, app/package.json]
key-decisions:
  - "strict:true placed in tsconfig.app.json/node.json (Vite template splits configs; root tsconfig.json is references-only)"
  - "Scaffolded Vite in a temp dir and merged to preserve app/README.md; removed empty app/amplify before Amplify init"
patterns-established:
  - "Production code under app/; figma-make/ frozen"
requirements-completed: [INFRA-01]
duration: ~12min
completed: 2026-11-03
---

# Phase 1 / Plan 01: Scaffold Summary

**Vite React-TS + Amplify Gen 2 backend skeleton rooted at `app/`, with strict TypeScript, skipLibCheck TS2590 mitigation, secret/output gitignores, the us-east-1 region constant, and a Vitest runner.**

## Performance
- **Duration:** ~12 min
- **Completed:** 2026-11-03
- **Tasks:** 3
- **Files modified:** 26 tracked

## Accomplishments
- `app/` created as the production root (Vite React-TS), Amplify Gen 2 added (`amplify/{backend.ts,auth,data}`), skeleton dirs `amplify/shared`, `amplify/functions/pre-sign-up`, `src/lib`.
- Dependencies: `aws-amplify`, `zod`, `-D @types/aws-lambda`, `vitest`. `aws-cdk-lib`/`@aws-amplify/backend` came with the Amplify template.
- TS strict enabled (tsconfig.app.json + tsconfig.node.json); `amplify/tsconfig.json` already strict + skipLibCheck.
- `.gitignore` extended with `.env`/`.env.*`; `amplify_outputs*` already ignored (confirmed via `git check-ignore`).
- `amplify/shared/config.ts` exports `AWS_REGION = 'us-east-1'` and `BEDROCK_MODEL_ID = 'TBD'`.

## Task Commits
1. **Scaffold + deps + dirs + tsconfig** — folded into `8e803d0`
2. **gitignore + config.ts** — `8e803d0`
3. **Vitest config + test script** — `8e803d0`

(Inline sequential execution committed Plan 01 as one atomic scaffold commit `8e803d0`; planning docs in `68ef642`.)

## Files Created/Modified
- `app/amplify/shared/config.ts` — single-region source of truth (us-east-1)
- `app/vitest.config.ts` — node-env unit test runner
- `app/tsconfig.app.json`, `app/tsconfig.node.json` — added `"strict": true`
- `app/.gitignore` — added `.env`/`.env.*` (amplify_outputs already ignored)
- `app/package.json` — name `bridge-app`, added `"test": "vitest run"`

## Deviations from Plan

### Auto-fixed Issues

**1. [Acceptance-criterion file target] strict lives in tsconfig.app.json, not tsconfig.json**
- **Found during:** Task 1-01-01
- **Issue:** Plan's acceptance criterion greps `app/tsconfig.json` for `"strict": true`, but the current Vite React-TS template makes `tsconfig.json` a references-only file; compiler options live in `tsconfig.app.json`/`tsconfig.node.json`.
- **Fix:** Added `"strict": true` to `tsconfig.app.json` and `tsconfig.node.json` (correct placement). `amplify/tsconfig.json` already had strict + skipLibCheck (covers the schema TS2590 path).
- **Verification:** `grep '"strict": true' tsconfig.app.json amplify/tsconfig.json` succeeds; intent (strict app) satisfied.

**2. [Blocking] Amplify init refused the pre-existing empty `app/amplify/` dir**
- **Found during:** Task 1-01-01
- **Issue:** `npm create amplify` errors if `amplify/` exists (mistook it for Gen 1). The placeholder `app/amplify/.gitkeep` from the discuss step created it.
- **Fix:** Removed the empty `app/amplify` dir, re-ran `npm create amplify@latest --yes` successfully. Also scaffolded Vite in a temp dir and merged to preserve the hand-written `app/README.md`.
- **Verification:** `amplify/{backend.ts,auth/resource.ts,data/resource.ts}` present.

---
**Total deviations:** 2 auto-fixed (1 config-placement, 1 blocking scaffold-order)
**Impact on plan:** No scope change; both necessary for the current Vite/Amplify template behavior.

## Issues Encountered
None beyond the two deviations above.

## Next Phase Readiness
- Wave 2 ready: `amplify/auth/resource.ts` and `amplify/data/resource.ts` still hold the default Amplify Todo/guest scaffold — Plans 02 and 03 overwrite them with Bridge's auth + 9-model schema.
- `app/node_modules` present; `tsc`/`vitest` runnable locally. No AWS yet (Waves 3–4).

---
*Phase: 01-foundation-authentication*
*Completed: 2026-11-03*
