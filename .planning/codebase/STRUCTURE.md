# Codebase Structure

**Analysis Date:** 2026-11-03

## Directory Layout

```
neuro/
├── .claude/                    # AI team instructions & skills
│   ├── CLAUDE.md              # Bridge: AI instructions (read before working)
│   └── skills/bridge/SKILL.md  # Detailed team rules, product context, code standards
├── .planning/                  # GSD orchestrator planning docs
│   └── codebase/              # Architecture & conventions analysis (this directory)
├── AI_PROMPTS/                # Prompt logging per teammate (Tejas, Dhyey, etc.)
├── Context/                   # Background docs (research, references)
├── docs/                      # Product & challenge docs
│   ├── FirstPlace/            # Partner organization materials
│   ├── AI_INTEGRATION.md      # How live Bedrock calls connect to UI
│   ├── GSD_KICKOFF.md         # GSD phase planning
│   └── (challenge PDFs, handbook, rubric)
├── figma-make/                # React prototype (running in Figma Make)
│   └── src/
│       ├── App.tsx            # Entire app: components, state, rendering (2190 lines)
│       └── index.css          # All styling: animations, layout, themes (154 lines)
├── idea/                      # Early design sketches and briefs
├── scripts/                   # Automation & seeding
│   ├── hooks/                 # Git hooks & AI prompt logging
│   │   └── bridge-hooks.mjs   # Enforces pull-before-push, blocks force-push main, logs prompts
│   └── seed/                  # Data seeding for real DynamoDB (future)
├── tech design/               # AWS tech stack & API design
│   └── index.html             # Architecture decisions: Amplify Gen 2, Lambda, Bedrock
├── figma-make/FIGMA_MAKE_CONTEXT.md  # How to export from Figma Make to code
├── README.md                  # Project overview, team, how we built it, AI disclosure
└── .gitignore                 # (minimal; no .env checked in)
```

## Directory Purposes

**`.claude/`**
- Purpose: AI instructions specific to Bridge project
- Contains: Team rules (prompt logging, pull before push, real Cognito/DynamoDB, no mocks), product context (what Bridge is, users, Mo, priorities), code standards (TypeScript strict, no @ts-nocheck, comment the why), app prompts format
- Key files: `SKILL.md` is the reference for every AI session; `CLAUDE.md` is the minimal version for Claude Code

**`.planning/codebase/`**
- Purpose: Documentation for `/gsd:plan-phase` and `/gsd:execute-phase` orchestrators
- Contains: ARCHITECTURE.md (patterns, layers, data flow), STRUCTURE.md (this file), plus future CONVENTIONS.md, TESTING.md, STACK.md, CONCERNS.md
- How used: Planner loads relevant docs when creating phases; executor references when writing code

**`AI_PROMPTS/`**
- Purpose: Append-only log of every prompt sent to any AI tool (compliance for North American AI Challenge handbook)
- Contains: One markdown file per teammate (Tejas.md, Dhyey.md, Shreeya.md, Rishi.md)
- Entry format: ID, title, type, model, location, guardrails, last changed date
- How populated: Claude Code hook (`bridge-hooks.mjs`) auto-logs; other tools manual via `node scripts/hooks/bridge-hooks.mjs log-prompt --tool "X"` with user message on stdin

**`docs/FirstPlace/`**
- Purpose: Partner materials and consent (First Place AZ is the autism support partner)
- Contains: (Likely participant info, project context, ethics docs—not inspected for sensitive content)

**`figma-make/src/`**
- Purpose: React prototype running in Figma Make editor
- Code patterns: All UI and state in one file; no node_modules (Figma Make sandboxed); exports to `.tsx` for copy into Vite project
- Export workflow: Changes made in Figma Make (AI-assisted), code lives in `App.tsx`, manual review before commit

**`tech design/`**
- Purpose: Architecture reference for real backend (not implemented in prototype)
- Contains: AWS stack decisions (Amplify Gen 2, Cognito, AppSync, DynamoDB, Lambda, Bedrock), region/model TBD, database schema, API endpoints

**`scripts/`**
- Purpose: Automation for team
- `hooks/bridge-hooks.mjs`: Enforces `git pull --rebase` before push, blocks force-push on main, prevents committing .env or keys, logs AI prompts with git user email
- `seed/`: (Future) TypeScript idempotent scripts to create test data in real DynamoDB (made-up names, no First Place participant data)

## Key File Locations

**Entry Points:**

- `figma-make/src/App.tsx` line 2184: App root wrapper (phone frame container)
- `figma-make/src/App.tsx` line 127: Bridge class (state + render)
- Browser renders to: Figma Make canvas or copied into Vite app

**Configuration:**

- `.claude/CLAUDE.md`: Minimal AI team rules (prompt logging, pull before push)
- `.claude/skills/bridge/SKILL.md`: Full reference (team rules, product context, code standards, prompt format)
- `.gitignore`: Minimal (allows AI_PROMPTS, docs, source)
- `README.md`: Project overview, team, how built, AI disclosure

**Core Logic:**

- `figma-make/src/App.tsx` lines 128-1098: renderVals() — all state transformations, data structures, event handlers
- `figma-make/src/App.tsx` lines 1114-2180: renderView() — all JSX, conditional screen rendering

**Styling:**

- `figma-make/src/index.css` lines 1-154: CSS variables, grid/flex, animations, component styles, responsive media queries

**Testing & Seeding:**

- `scripts/seed/` (not yet created): Will contain `seed.ts` to create circles, scenarios, test accounts in DynamoDB

## Naming Conventions

**Files:**

- React components: PascalCase in comments, all in single App.tsx (future: separate)
- Styles: kebab-case classes (e.g., `.circle-glyph`, `.event-row-card`)
- Utilities: camelCase functions (e.g., `renderVals()`, `changeWithUndo()`)

**Directories:**

- Top-level: kebab-case (figma-make, tech-design, AI_PROMPTS with underscores per team preference)
- Amplify structure (future): `amplify/auth/`, `amplify/data/`, `amplify/functions/`, `amplify/shared/`

**State Properties:**

- Short prefixes for grouping: `ci*` = check-in (ciFeel, ciUp, ciHard), `ev*` = event (evDate, evWhat, evVenue), `p*` = practice (pScen, pLevel, pOwn), `dm*` = direct message (dmDraft, dmKey)
- Booleans: prefixed `is` (isOnboard, isMeJourney) or suffixed `On` (momOn, mariaOn)
- Arrays: plurals (interests, events, dmMessages)

## Where to Add New Code

**New Feature (e.g., mood tracking, journaling):**
- Prototype: Add state fields in BridgeBase.renderVals() (line ~128), create screen JSX in renderView() (line ~1114), add CSS to index.css, add click handler in renderVals()
- Real build: API endpoint as Lambda in `amplify/functions/`, data model in `amplify/data/`, React components in `src/components/` or `src/screens/`

**New Component/Module:**
- Prototype: Add as function near top of App.tsx (like Mo, PersonAvatar) or inline in renderView()
- Real build: Create in `src/components/` if reusable, `src/screens/` if screen-level, with TypeScript and JSDoc comments

**New Practice Scenario:**
- Prototype: Add entry to `scripts` object in renderVals() (line ~240) with title, group, scene, opener, hint, good/vague replies, star/spark feedback
- Real build: Store in `amplify/data/Topic` table, seed via `scripts/seed/scenarios.ts`, fetch on practice screen load

**Utility/Helper:**
- Shared logic: Add function in renderVals() or as standalone before BridgeBase class, export if needed for real build
- Examples: `changeWithUndo()`, `evalOwn()`, `scenItem()` — closures capturing `self` and `state`

**Styling for New Screen:**
- Add `.me-sub-content` style pattern to index.css (sticky header + scrollable content + bottom action)
- Use existing BEM classes: `.card`, `.section-title`, `.meta-label`, `.primary-action`
- Leverage CSS variables: `var(--ink)`, `var(--bg)`, `var(--soft)`, `var(--muted)`

## Special Directories

**`.git/`**
- Purpose: Version control (main branch is production; one branch per person)
- Protected: main requires PR + review before merge; never force-push main

**`node_modules/` (if Vite project created)**
- Purpose: Dependencies (React, TypeScript, Vite, Amplify SDK)
- Not checked in; `.gitignore` excludes

**`.planning/`**
- Purpose: Generated by GSD orchestrators; not version controlled
- Purpose: Holds phase plans and codebase analysis docs
- Not committed unless explicitly requested

**`Context/` & `idea/`**
- Purpose: Research archive and early design sketches
- Status: Background reference only; not part of active prototype

## How Prototype → Real Build

**Figma Make:**
```
App.tsx (2190 lines)
├── Copy to new Vite project
├── Split into `src/components/` (Mo, Avatar, etc.)
├── Extract `src/screens/` (Onboarding, CheckIn, Home, etc.)
├── Move `renderVals()` logic into Redux/Zustand or custom hooks
└── Keep index.css, add Tailwind or CSS modules
```

**Backend Setup:**
```
amplify/ (new directory)
├── auth/resource.ts (Cognito, no roles)
├── data/resource.ts (User, Group, Message, Event, etc. models)
├── functions/
│   ├── practice.ts (Lambda with practice scenario + Bedrock call)
│   ├── tone.ts (tone check: keyword layer + LLM if needed)
│   ├── classify.ts (universal labeler: crisis, bias, etc.)
│   └── prompts.ts (system prompts as named constants)
├── shared/config.ts (region, model ID, etc.)
└── schema.ts (generated types from data models)
```

**Scripts:**
```
scripts/
├── seed/
│   ├── seed.ts (idempotent: Cognito + DynamoDB test data)
│   └── scenarios.ts (7 practice scenarios)
├── hooks/
│   └── bridge-hooks.mjs (already exists; works with real repo)
└── bias_probe.py (prompt testing for bias before launch)
```

---

*Structure analysis: 2026-11-03*
