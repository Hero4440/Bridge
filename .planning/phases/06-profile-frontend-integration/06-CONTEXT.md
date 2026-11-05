# Phase 6: Profile & Frontend Integration - Context

**Gathered:** 2026-11-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the production frontend in `app/src/` by extracting screens from the `figma-make/` prototype and wiring them to the existing Amplify Data/Auth library layer (`app/src/lib/`). Add profile persistence (User CRUD + S3 photo upload) and consistent loading/error states. This delivers PROFILE-01..04 and FRONTEND-01..08.

The backend (schema, Lambdas) and library layer (auth, data, messages, dm, safety, rsvp, reflection, prep, chips, topics, connection) are complete from Phases 1-5. What's missing is the UI layer: screens, profile lib, and state management.

</domain>

<decisions>
## Implementation Decisions

### D-01: Build production code in app/src/, not wire into figma-make
- **Decision:** Extract screens from `figma-make/src/App.tsx` (2190-line class component) into proper TypeScript components in `app/src/screens/` and `app/src/components/`.
- **Rationale:** User requirement: "we have to make a product not just demo" — the prototype is `@ts-nocheck` with inline state and is a design artifact. Production code needs proper types, component structure, and maintainability.
- **Pattern:** Copy design/behavior from `figma-make/`, code cleanly in `app/src/`. The prototype is the reference, not the codebase.

### D-02: User row creation — lazy (first profile save)
- **Decision:** User row is created on first profile save (onboarding complete or settings change), not on sign-up.
- **Rationale:** The pre-sign-up Lambda already auto-confirms Cognito users. Creating the User row lazily avoids a separate post-confirmation trigger and keeps the onboarding flow simple (no forced profile step before exploring).
- **Implementation:** Check if User row exists on app load; if not, show onboarding. Save creates the row with owner binding via Cognito sub.

### D-03: Photo upload — S3 via Amplify Storage, schema adds photoKey
- **Decision:** Add `photoKey: a.string()` to the User model (stores S3 key). Upload via Amplify Storage (`uploadData` from `aws-amplify/storage`). Validation client-side: max 5MB, MIME `image/jpeg|image/png|image/webp`.
- **Rationale:** Amplify Storage manages S3 bucket + IAM automatically. Storing the key (not the full URL) keeps the schema stable if bucket/region changes. Construct URL on render with `getUrl`.
- **Pattern:** Matches Phase 3/4/5 approach (schema owns the data model, client lib wraps the API).

### D-04: Theme/comfort settings persistence — optimistic DynamoDB update
- **Decision:** Update CSS variables immediately on tap (optimistic UI, same as prototype's `saveQuietly`), then fire background DynamoDB update via `updateUser`. On page load, read User row and apply theme/comfort values.
- **Rationale:** The prototype's instant visual feedback is the right UX. DynamoDB is the single source of truth (no localStorage) — optimistic update gives instant feel without round-trip latency, and sync on load ensures consistency.
- **Implementation:** CSS variables map to User fields: `theme → --bg/--ink/--soft/--muted`, `comfortCalmMode → .calm-mode class`, `comfortTextSize → .text-large class`.

### D-05: Screen extraction approach — functional components + hooks
- **Decision:** Extract screens as functional components with hooks (`useState`, `useEffect`). Each screen calls the appropriate `app/src/lib/` module (e.g., Home calls `listEvents`, CircleChat calls `observeMessages`).
- **Rationale:** The prototype uses class components with a monolithic state object. Production code uses modern React patterns (hooks, functional components) for better readability and easier testing. The lib layer is already hook-compatible.
- **Pattern:** One screen component per file in `app/src/screens/`, shared UI pieces (Mo, NavBar, StatusBar) in `app/src/components/`.

### D-06: Loading/error states — consistent pattern across all screens
- **Decision:** Every screen that calls an async lib function shows:
  - **Loading:** Skeleton or spinner (while data fetches)
  - **Error:** Retry button + clear message (when lib throws)
  - **Empty:** Designed empty state (when list is empty but no error)
- **Rationale:** FRONTEND-07/08 requirements. The lib layer throws on `errors?.length` but nothing catches them yet. Consistent UX across all screens prevents silent failures and confusion.
- **Pattern:** `try { setLoading(true); await libCall(); } catch (e) { setError(e.message); } finally { setLoading(false); }` in every data-fetching `useEffect`.

### D-07: Auth flow — signed-out shows Login/Signup, signed-in shows app
- **Decision:** `App.tsx` checks `getCurrentUser()` on mount. If unauthenticated → show Login/Signup screens. If authenticated → check for User row, show Onboarding if missing, otherwise show Home.
- **Rationale:** FRONTEND-02 requirement. Clean separation: auth state determines outer routing, User row existence determines onboarding vs main app.
- **Implementation:** Top-level `useEffect` with `getCurrentUser` + `Hub.listen('auth')` for sign-in/sign-out events.

### D-08: Profile lib module — CRUD for User model + S3 upload
- **Decision:** Create `app/src/lib/profile.ts` with:
  - `getCurrentUserProfile()` — fetch User row for current Cognito user
  - `createUserProfile(input)` — create User row (first save)
  - `updateUserProfile(input)` — update User row (settings changes)
  - `uploadPhoto(file)` — validate + upload to S3, return key
- **Rationale:** PROFILE-01/02/03/04 requirements. Follows the same pattern as `data.ts`, `rsvp.ts`, etc.: typed inputs, throw on errors, single Data client import.
- **Pattern:** Same as Phase 3-5 libs: `generateClient<Schema>()`, typed exports, unit-testable.

### Claude's Discretion
- Exact component file names and directory structure in `app/src/screens/` and `app/src/components/`
- Whether to extract shared hooks (e.g., `useAuth`, `useProfile`, `useConnection`) or inline logic
- CSS module approach (single `index.css` vs per-component CSS files) — prototype uses one big `index.css`
- Routing approach (hash-based state like prototype, or React Router, or simple useState)
- Order of screen implementation (which screens to build first)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product requirements
- `.claude/skills/bridge/SKILL.md` §2.2 — contacts (no roles), guardian/trusted person (person-set permissions)
- `.claude/skills/bridge/SKILL.md` §2.4 — prototype behavior (onboarding, check-in, practice, circles, events, DMs, profile, Mo, UI/UX design, notifications)
- `.claude/skills/bridge/SKILL.md` §2.9 — design (calm, soft, rounded; 44px tap targets; safety warnings private; avoid childish/loud/clutter; Outfit font, dark pill nav, themes via CSS variables)
- `.planning/REQUIREMENTS.md` — PROFILE-01..04, FRONTEND-01..08 (profile persistence, Amplify client init, mock state replaced, loading/error states)

### Prior phase context
- `.planning/phases/01-foundation-authentication/01-CONTEXT.md` — auth decisions (email/password only, User model fields)
- `.planning/phases/03-events-persistence/03-CONTEXT.md` — event CRUD, RSVP, prep, reflection patterns
- `.planning/phases/04-real-time-chat/04-CONTEXT.md` — Message subscription, connection state, last-50 window
- `.planning/phases/05-safety-direct-messages/05-CONTEXT.md` — DM hold/deliver, crisis detection, help alerts

### Existing code
- `app/src/lib/auth.ts` — signUp, signIn, signOut, currentUser, currentSession (wired to Cognito)
- `app/src/lib/data.ts` — createEvent, listEvents, getEvent, updateEvent
- `app/src/lib/rsvp.ts` — setRsvp, getRsvp, listRsvpsForEvent, countRsvps
- `app/src/lib/messages.ts` — sendMessage, observeMessages, lastN
- `app/src/lib/dm.ts` — sendDm, respondToRequest, listRequests, observeThread, threadId
- `app/src/lib/safety.ts` — reportMessage, blockContact, sendHelpAlert
- `app/src/lib/reflection.ts` — saveReflection, resolveReply
- `app/src/lib/prep.ts` — prepFor, whatToExpect
- `app/src/lib/chips.ts` — suggestForChip
- `app/src/lib/topics.ts` — getDailyTopic
- `app/src/lib/connection.ts` — bannerFor, onConnectionChange
- `app/amplify/data/resource.ts` — full schema (User, Message, Event, RSVP, PracticeRun, Reflection, Contact, GuardianLink, Notification, Group, Topic, MessageRequest, Report + custom queries/mutations)

### Design reference
- `figma-make/src/App.tsx` — 2190-line prototype with all screens, Mo component, CircleGlyph, PersonAvatar, BadgeMark, StatusBar, theme logic, comfort settings UI, onboarding flow, check-in, practice, circles, events, DMs, reflections, profile/settings
- `figma-make/src/index.css` — CSS variables, animations (breathe, floaty, rise, screenIn, screenBack, moHop, celebrate, typingDot, moThink), calm-mode and text-large classes

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **All lib modules** (`auth`, `data`, `rsvp`, `messages`, `dm`, `safety`, `reflection`, `prep`, `chips`, `topics`, `connection`) — fully typed, tested, ready to wire into screens
- **Mo component** (in prototype) — SVG avatar with 3 moods (happy, worried, calm), reusable
- **CircleGlyph, PersonAvatar, BadgeMark, DateTile, MapThumb** (in prototype) — small UI components, can be extracted as-is
- **StatusBar** (in prototype) — iOS-style status bar with time + icons

### Established Patterns
- **Lib layer pattern** (from Phases 3-5):
  - `generateClient<Schema>()` at top of file
  - Typed inputs: `Parameters<typeof client.models.X.create>[0]`
  - Throw on `errors?.length` with `JSON.stringify(errors)`
  - Pure helpers unit-tested separately (e.g., `lastN`, `countRsvps`, `threadId`)
- **Auth state** (Phase 1): `getCurrentUser()` returns `{ userId, username }`, `Hub.listen('auth')` for sign-in/sign-out events
- **Subscription pattern** (Phase 4): `observeQuery()` with filter, returns subscription object (caller must `.unsubscribe()`)
- **Owner binding** (Phases 3/5): Lambda-written owner models use `allow.ownerDefinedIn('userId').identityClaim('sub')`

### Integration Points
- **`app/src/main.tsx`** — Amplify.configure already called, StrictMode wraps `<App />`
- **`app/amplify/data/resource.ts`** — schema is the single source of truth for types
- **`app/src/App.tsx`** — currently Vite scaffold (122 lines), needs to become the top-level router (auth check → Onboarding vs Home)
- **CSS variables** (from prototype): `--bg`, `--bar`, `--ink`, `--soft`, `--muted` (theme-dependent), `--calm-mode` class, `--text-large` class

### Missing (Phase 6 scope)
- **`app/src/lib/profile.ts`** — User CRUD + S3 photo upload (PROFILE-01..04)
- **`app/src/screens/`** — all screens (Onboarding, CheckIn, Home, Circles, CircleChat, Events, EventDetail, Practice, Reset, Reflect, Me, Notifications, DMs, Login, Signup)
- **`app/src/components/`** — shared UI (Mo, NavBar, StatusBar, CircleGlyph, PersonAvatar, BadgeMark, ConnectionBanner, EmptyState, LoadingSpinner, ErrorRetry)
- **User.photoKey field** — schema update (D-03)
- **Loading/error state handling** — consistent try/catch/finally in every data-fetching screen (D-06)

</code_context>

<specifics>
## Specific Ideas

**From prototype inspection:**
- Theme CSS variables map: `dawn → { bg: '#FFF9F6', bar: '#F5EDE8', ink: '#3B3350', soft: '#F9DCE4', muted: '#9D8FA3' }`, `sage → { bg: '#F8FAF6', bar: '#E8F0E4', ink: '#3B3B3A', soft: '#DDF1E6', muted: '#8C9B8A' }`, `mist → { bg: '#F6F8FA', bar: '#E4EAF0', ink: '#3B3350', soft: '#DCE4FA', muted: '#8F9AAA' }`, `sand → { bg: '#FAF8F4', bar: '#F0EBE2', ink: '#3B3350', soft: '#F6E5C9', muted: '#A89B85' }`
- Onboarding flow: 5 steps (welcome → interests → meet Mo → trusted person → comfort)
- Check-in captures: feeling (Overwhelmed/Frustrated/Okay/Ready), what's coming up, what's hardest
- Practice has 7 scenarios × 3 levels, returns strength + tip
- Circles show daily topic at top, starter chips (ask question, share story, write own), last 50 messages
- Events have 3-step create wizard: (1) what/host, (2) when/where/format, (3) comfort settings
- RSVP shows X going / Y maybe / Z can't
- DMs reuse Message model with threadId = `dm#<sorted uid pair>`
- Reflections: feeling (hard/okay/good) + wins (3 taps), Mo replies
- Profile settings: theme (4 choices), interests (multi-select), trusted person (name/relation/contact), comfort (text size, calm mode, chat preference, words preference)

**No mocks anywhere** (SKILL §1.3): circles are real Group rows (seeded), events/messages/DMs persist to DynamoDB, practice calls real Bedrock.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 06-profile-frontend-integration*
*Context gathered: 2026-11-04*
