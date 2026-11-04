---
plan: 01
title: Scaffold Amplify Gen 2 + Vite project
wave: 1
depends_on: []
autonomous: true
files_modified:
  - app/package.json
  - app/.gitignore
  - app/tsconfig.json
  - app/vitest.config.ts
  - app/amplify/shared/config.ts
  - app/amplify/backend.ts
requirements: [INFRA-01]
must_haves:
  - "app/ exists as a Vite React-TS project with Amplify Gen 2 directory layout (amplify/{backend.ts,auth,data,functions,shared})"
  - "app/amplify_outputs.json is gitignored (never committed)"
  - "Region us-east-1 recorded as the single source of truth in app/amplify/shared/config.ts"
  - "Vitest installed and runnable so Wave-2 handler unit test has a runner"
---

<objective>
Create the production project root `app/` as an Amplify Gen 2 + Vite React-TS project with the full directory skeleton, strict TypeScript, a gitignore that protects generated outputs, the single-region config constant (D-01), and Vitest wired for the pre-sign-up handler test that Plan 02 adds. This is pure scaffolding: no auth/data logic yet, but it establishes the layout every other plan writes into. figma-make/ is frozen and MUST NOT be touched (D-09).
</objective>

<threat_model>
- T-1-01 | amplify_outputs.json (contains endpoints, pool IDs, API keys) committed to a public repo | STRIDE:Information Disclosure | severity:high | mitigation: task 1-01-02 adds `amplify_outputs.json` to app/.gitignore and proves it with `git check-ignore`
- T-1-02 | Secrets or AWS keys committed via scaffolding | STRIDE:Information Disclosure | severity:high | mitigation: task 1-01-02 gitignores `.env*` and `node_modules`; no `.env` file is created (SKILL §1.4 — secrets via `secret()`/SSO only)
</threat_model>

<task id="1-01-01">
  <action>
From the workspace root, scaffold the Vite app then layer Amplify in. Amplify's initializer refuses a non-empty dir, so create Vite first, then run the Amplify generator which only adds an `amplify/` folder and deps:
1. `npm create vite@latest app -- --template react-ts`
2. `cd app && npm install`
3. `npm create amplify@latest -- --yes` (adds `app/amplify/{backend.ts,auth/resource.ts,data/resource.ts}`, `app/package.json` amplify deps, and `app/amplify_outputs.json` placeholder). If it still refuses the non-empty dir, generate in a temp dir and move the `amplify/` folder + merge the devDeps into `app/package.json`.
4. Install runtime/dev deps: `npm install aws-amplify zod` and `npm install -D @types/aws-lambda`.
5. Create the remaining skeleton dirs/files (empty stubs, real content comes in later plans): `app/amplify/shared/`, `app/amplify/functions/pre-sign-up/`, `app/src/lib/`.
6. In `app/tsconfig.json` ensure `"strict": true` and add `"skipLibCheck": true` (TS2590 mitigation per RESEARCH). No `@ts-nocheck` anywhere in app/.
Do NOT edit anything under figma-make/.
  </action>
  <read_first>01-CONTEXT.md; 01-RESEARCH.md; .claude/skills/bridge/SKILL.md (§1.4, §3, §2.5)</read_first>
  <acceptance_criteria>
- `test -f app/package.json && test -d app/amplify && test -f app/amplify/backend.ts` all succeed
- `grep -q '"aws-amplify"' app/package.json` and `grep -q '"zod"' app/package.json` and `grep -q '"@types/aws-lambda"' app/package.json`
- `grep -q '"strict": true' app/tsconfig.json` and `grep -q '"skipLibCheck": true' app/tsconfig.json`
- `test -d app/amplify/functions/pre-sign-up && test -d app/amplify/shared && test -d app/src/lib`
- `grep -rL "" figma-make/ | wc -l` unchanged (no figma-make modification) — i.e. `git status --porcelain figma-make/` prints nothing
  </acceptance_criteria>
</task>

<task id="1-01-02">
  <action>
Protect generated/secret artifacts and record the region.
1. Ensure `app/.gitignore` contains (append if the Vite template file lacks them): `node_modules`, `amplify_outputs*`, `.amplify`, `.env`, `.env.*`, `dist`.
2. Create `app/amplify/shared/config.ts` with a file-header comment and the single-region constant (D-01):
```ts
// app/amplify/shared/config.ts
// Single source of truth for the one AWS region Bridge uses for everything
// (Cognito, AppSync/DynamoDB, Lambda, Bedrock, Budgets). D-01: us-east-1.
export const AWS_REGION = 'us-east-1' as const;
// Bedrock model ID is resolved in Phase 2 via `aws bedrock list-inference-profiles`.
export const BEDROCK_MODEL_ID = 'TBD' as const;
```
  </action>
  <read_first>app/.gitignore; 01-CONTEXT.md (D-01); 01-RESEARCH.md</read_first>
  <acceptance_criteria>
- `grep -q 'amplify_outputs' app/.gitignore` and `grep -q '.env' app/.gitignore`
- `cd app && git check-ignore amplify_outputs.json` prints `amplify_outputs.json` (exit 0)
- `grep -q "AWS_REGION = 'us-east-1'" app/amplify/shared/config.ts`
- `head -1 app/amplify/shared/config.ts` begins with `//` (file-header comment present, SKILL §3.2)
  </acceptance_criteria>
</task>

<task id="1-01-03">
  <action>
Install and configure Vitest so Plan 02's pre-sign-up handler unit test has a runner (validation strategy Wave 0).
1. `cd app && npm install -D vitest`
2. Create `app/vitest.config.ts`:
```ts
// app/vitest.config.ts
// Test runner config for unit tests (e.g. the pre-sign-up Lambda handler).
// Live AWS validation is authoritative; unit tests cover pure logic only.
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'node', include: ['amplify/**/*.test.ts', 'src/**/*.test.ts'] } });
```
3. Add `"test": "vitest run"` to `app/package.json` scripts.
  </action>
  <read_first>app/package.json; 01-VALIDATION context in planning_context</read_first>
  <acceptance_criteria>
- `grep -q '"vitest"' app/package.json`
- `test -f app/vitest.config.ts`
- `cd app && npx vitest run --passWithNoTests` exits 0
- `grep -q '"test": "vitest run"' app/package.json`
  </acceptance_criteria>
</task>

<verification>
Run from workspace root: `test -d app/amplify && cd app && git check-ignore amplify_outputs.json && grep -q "us-east-1" amplify/shared/config.ts && npx vitest run --passWithNoTests`. Expected: command chain exits 0, prints `amplify_outputs.json`, Vitest reports "no test files" and passes. figma-make/ shows no git changes.
</verification>
