# Codebase Concerns

**Analysis Date:** 2025-11-03

## Tech Debt

### Monolithic Component File

**Issue:** `figma-make/src/App.tsx` is a 2,190-line single React class component with all state, logic, and UI rendering in one file. No component splitting despite documentation saying it "is being split into components."

**Files:** `figma-make/src/App.tsx`

**Impact:**
- Extremely difficult to test, debug, or maintain
- Changes to one feature risk breaking unrelated screens
- No code reuse; similar UI patterns (modals, forms, lists) are re-implemented inline
- Type safety is disabled (`// @ts-nocheck` on line 1)
- Onboarding anyone new to the codebase requires reading and understanding the entire 2,190-line file

**Fix approach:**
- Extract components by screen/feature (Home, Circles, Practice, Events, Me, etc.) into `src/components/` and `src/screens/`
- Move state sections (events, DMs, profiles, etc.) into their own renderVals methods or custom hooks once TypeScript is enabled
- Enable strict TypeScript and remove `@ts-nocheck`
- Define types for each screen's state shape; currently inferred from inline usage

---

### TypeScript Disabled

**Issue:** Line 1 declares `// @ts-nocheck`, disabling all TypeScript checking on the entire 2,190-line file. No types are declared; variables use implicit `any`.

**Files:** `figma-make/src/App.tsx`

**Impact:**
- IDE cannot catch missing properties, type mismatches, or API contract violations
- Refactoring is error-prone; renaming state fields requires manual grep
- No autocomplete on state properties or function signatures
- Easier to introduce bugs when adding new features

**Fix approach:**
- Add `tsconfig.json` with `strict: true`
- Remove `@ts-nocheck` and add type definitions for state, props, and component methods
- Start with interface for main state shape; gradually type methods and event handlers
- Prioritize typing state sections in the order they're added to Amplify (avoid breaking existing prototype)

---

### Stateless Prototype, State Not Persisted

**Issue:** All state lives in React component state (`this.state`). Reloading the page resets everything: events, RSVPs, messages, theme, profile changes, onboarding progress.

**Files:** `figma-make/src/App.tsx` (entire state management)

**Impact:**
- User tests see data disappear on refresh; confusing for testers and users
- Prototype behavior doesn't match production expectations (which uses DynamoDB)
- Session recovery / offline support not tested
- No way to demo persistence before Amplify integration

**Fix approach:**
- Add localStorage serialization for core state (theme, onboarding complete, profile, event RSVPs)
- Use a simple `loadState()` / `saveState()` pattern in `componentDidMount()` and after `setState()`
- Document which state is persisted (localStorage) vs ephemeral (check-in, practice feedback, transient modals)
- Plan: once Amplify backend is ready, replace localStorage calls with Cognito user data and DynamoDB queries

---

### Hardcoded Demo Data

**Issue:** Events, circles, messages, and user contacts are hard-coded arrays in `renderVals()`. Examples: venues list (lines 407–411), circle names (`circleData`), message threads with Maya/Jordan/Priya, event prep scenarios.

**Files:** `figma-make/src/App.tsx` (throughout, especially lines 400–500)

**Impact:**
- Difficult to test variations (e.g., no events, many events, international venues)
- Demo data inconsistencies (e.g., events array has an event not in RSVP tracking)
- Onboarding circles must match `circleData` keys; easy to break if names change in Figma but not in code
- No clear story for where demo data comes from once Amplify is live (seed scripts? API?)

**Fix approach:**
- Move demo data to a separate `data/fixtures.ts` file with clear structure
- Define TypeScript types for Event, Circle, Message, User so demo data structure is checked
- Plan seed strategy: hard-code enough fixture data for prototype; once Amplify is ready, move to `scripts/seed/` Lambda or script that writes to real DynamoDB
- Document which fields in demo data are required vs optional for the UI to work

---

## Known Bugs

### State Loss on RSVP Accept/Decline

**Issue:** Tapping "Going" or "Can't go" on an event in the event detail screen may lose the RSVP choice if the user navigates away quickly.

**Files:** `figma-make/src/App.tsx` (RSVP state mutations, search for `rsvp[` around line 600–700)

**Trigger:**
1. Open an event detail
2. Tap "Going" or "Can't go"
3. Quickly swipe back or tap Home

**Workaround:** Refresh the page; state resets and the RSVP is not saved anyway (no persistence).

**Root cause:** RSVP state updates don't trigger a local save (localStorage) and may conflict if state is changed while a screen transition is in progress.

---

### "I need help" Doesn't Save Linked Guardian

**Issue:** Tapping "I need help" opens a screen to pick a trusted person or 988, but selecting doesn't create any record and doesn't notify the trusted person in the prototype. In production, this needs to create a notification and potentially send a message.

**Files:** `figma-make/src/App.tsx` (search for "need help" UI around line 1900–1950)

**Impact:** Feature appears functional in demo but doesn't actually alert anyone. Production must implement DynamoDB write and push notification or SMS.

**Fix approach:**
- Prototype: disable the feature or show a "Demo: this would send to [trusted person]" toast
- Production: Lambda that creates a Notification record and (if settings allow) sends push or SMS via Pinpoint/SNS

---

### Message Requests Never Mark Accepted

**Issue:** Alex's unsafe message request shows a modal warning with Report and Block buttons, but no Accept/Decline option. Tapping outside the modal dismisses it, but the request remains indefinitely.

**Files:** `figma-make/src/App.tsx` (search for "unsafe message" or "request held", around line 1600–1700)

**Impact:**
- Guardian/trusted-person connection requests and message requests have no accept/decline flow implemented in the prototype
- Both features are listed as must-work for Nov 6 in SKILL.md section 2.6

**Fix approach:**
- Add Accept/Decline buttons to the request modal
- Move request to Messages > Accepted after accept; remove from queue
- For safe requests: implement the flow; for unsafe: show the warning and only allow Report/Block

---

## Security Considerations

### No Input Validation in Message and Tone-Check UI

**Risk:** When users type in circles or DMs, there's no client-side validation before the mock "Mo tone check" logic runs. In production, unvalidated input goes to Bedrock. Bedrock calls should validate message length and content type.

**Files:** `figma-make/src/App.tsx` (DM input, circle chat input, tone-check triggers)

**Current mitigation:** Mock Bedrock calls use hard-coded rules; no actual Bedrock call in prototype.

**Recommendations:**
- Add client-side length cap (e.g., 500 chars per `docs/AI_INTEGRATION.md`) before tone check
- Lambda that calls Bedrock must validate with zod (Amplify uses zod automatically)
- Bedrock system prompts must ban requests for addresses, SSN, financial data (see SKILL.md 2.7 guardrails)
- Log request/response latency and fallback flag to CloudWatch, never message content

---

### No DM Request Moderation Flow

**Risk:** In DMs, the first message from a non-contact is supposed to be held by Mo and checked for unsafe requests (money, secrecy, meeting alone). Prototype shows an Alex example but no moderation decision UI or actual filtering.

**Files:** `figma-make/src/App.tsx` (search for "Alex" or "unsafe message" in the DM section, around line 1500–1700)

**Current mitigation:** Hard-coded that Alex's message is flagged; all others are allowed.

**Recommendations:**
- In production, define "unsafe request" rules clearly (SKILL.md hints: "money or addresses")
- Lambda `classify()` function must run on all first DMs from non-contacts
- Show warning UI only for flagged messages; allow user to Report, Block, or Decline Request
- Never auto-rewrite or hide the message; always show it with a warning ("Mo flagged this")

---

### Photos Uploaded to Browser Memory Only

**Risk:** Profile photo upload (`src/profile-photo-row` around line 2122) reads files with `FileReader` and stores base64 in state. No server-side validation, virus scan, or size limit. In production, photos go to S3 via a signed URL.

**Files:** `figma-make/src/App.tsx` (line 2122, `pickPhoto` handler)

**Current mitigation:**
- Prototype stores in memory; no actual upload
- File input has `accept="image/*"`

**Recommendations:**
- Client: add size limit (e.g., max 5 MB) and MIME type check before uploading
- Lambda: validate MIME type, size, and scan with an image service (e.g., AWS Rekognition for CSAM)
- S3: enable versioning and point-in-time recovery in case of malicious uploads

---

## Performance Bottlenecks

### Entire App Re-renders on Every State Change

**Issue:** The `Bridge` class component re-renders the entire JSX tree (2,190 lines) on every `setState()`, even if only one field changed (e.g., a single DM message or a theme toggle). React diffing helps, but no memoization or componentization.

**Files:** `figma-make/src/App.tsx` (entire file)

**Cause:** No `React.memo()` or `useMemo()` for sub-components; no `shouldComponentUpdate()` optimization

**Improvement path:**
- Extract each screen and major feature into separate memoized components
- Use context or custom hooks to pass down only needed state
- Measure with React DevTools Profiler; target 16ms render time on phone-width viewports

---

### Hard-Coded Time Formatting and String Manipulation

**Issue:** Event times, dates, and display strings are built by repeated string splits and re-joins (e.g., line 416: `evDate.split(' ')[0][0] + evDate.split(' ')[0].slice(1).toLowerCase() + ...`). No helper functions; logic is duplicated throughout.

**Files:** `figma-make/src/App.tsx` (lines 400–500, especially time/date logic; also in event display strings)

**Impact:**
- Hard to maintain and error-prone (e.g., off-by-one on date parsing)
- Slow when rendering hundreds of events
- No support for localization (other languages, 12/24-hour formats, timezones)

**Improvement path:**
- Extract date/time helpers to `lib/dateTime.ts` (format, parse, clash detection)
- Use a lightweight date library (e.g., date-fns) if more than 10 KB added would be acceptable
- Memoize format results for repeated event displays

---

### No Debounce on Tone-Check Trigger

**Issue:** The tone-check UI (e.g., harsh-word check in DMs, line ~1650) is triggered on every keystroke in the mock version. In production, calling Bedrock on every keystroke will be slow and expensive.

**Files:** `figma-make/src/App.tsx` (mock tone-check logic), then `docs/AI_INTEGRATION.md` Hook point 2

**Impact:**
- High latency if Bedrock is called per keystroke
- High cost (each call is billed)
- User sees slow UI feedback

**Improvement path:**
- Client debounce: wait 600 ms after typing stops before calling tone-check (as noted in `docs/AI_INTEGRATION.md`)
- AWS Lambda: set `maxTokens` low (e.g., 100 tokens max for tone check) to cap latency

---

## Fragile Areas

### Circle Chat Tone Check Depends on String Matching

**Issue:** The circle chat tone-check logic checks for specific words in the user's message (e.g., "whatever", "stupid", "shut up", see SKILL.md 2.3). The word list is hard-coded and matched case-insensitively. If someone types "Whatever!" or "WHATEVER", the match may fail.

**Files:** `figma-make/src/App.tsx` (search for `harshWords`, `toneLabel`, or the keyword list, around line 1400–1500)

**Why fragile:**
- Keyword matching is brittle; slang, abbreviations, and typos are missed
- No fuzzy matching or lemmatization
- Word list must be maintained in sync with production system prompts

**Safe modification:**
- Extract keyword list to a constant and test against real user messages from user research
- Add logging: "tone flagged for word X in message Y" (sanitized)
- Plan to replace with LLM `/tone` call once Bedrock is live
- Test: ensure both "Whatever" and "whatever" flag, but "water" and "power" don't

**Test coverage gaps:**
- No unit tests for word matching
- No test data with mixed-case, punctuation, or emoji variants

---

### Event Creation State Machine Incomplete

**Issue:** The three-step event creation wizard (lines 454–470) builds state step-by-step, but missing fields are not validated until creation. If the user goes back and changes a field, dependent fields (e.g., end time based on duration) may not update.

**Files:** `figma-make/src/App.tsx` (event creation logic, `createEvent` function around line 457)

**Why fragile:**
- No schema validation (e.g., title required, start time must be before end time)
- State branches not fully explored (e.g., what if user selects "In person" then changes back to "Online"? Old venue data lingers)
- Steps can be navigated out of order if you tap the back button repeatedly

**Safe modification:**
- Define event schema in TypeScript (or zod once in production)
- On field change, recompute dependent fields (e.g., end time after duration changes)
- Add validation before "Create" button is enabled
- Test: go back and forth between step 2 and 3; change mode from In person to Online and back

---

### Practice Scenario Levels Not Isolated

**Issue:** Practice scenarios (join, left on read, cancel, leave, repair, invite, disagree) share UI state for hints, user responses, and feedback. Switching scenarios mid-practice doesn't reset some state (e.g., previous scenario's response might appear).

**Files:** `figma-make/src/App.tsx` (practice/feedback screen logic, search for `practice`, `evalOwn`, `level` around lines 900–1200)

**Why fragile:**
- State keys like `pLevel`, `pScenario`, `pReply` are top-level in the Bridge state; not scoped per scenario
- No cleanup when scenario is dismissed

**Safe modification:**
- Move practice state to a nested object: `{ pScenario: null, pRun: { scenarioId, level, replies: [], feedback: null } }`
- Add a "start practice" function that resets `pRun` completely
- Test: start practice, go to level 2, dismiss, start a different scenario; verify level 1 is shown and reply history is empty

---

## Scaling Limits

### Single-File Architecture Cannot Scale

**Current capacity:**
- One developer can work on the file, but conflicts are high
- 2,190 lines is at the limit of human readability
- TypeScript disabled, so many bugs caught at runtime only

**Limit:**
- Once backend Lambdas and Amplify are added, the frontend will need to integrate API calls, data models, and error handling
- Current monolithic file will become a bottleneck for parallel development (Cognito setup, DynamoDB queries, message subscriptions)

**Scaling path:**
- Split into components (1-2 weeks refactoring)
- Add TypeScript strict mode
- Implement AppSync client for real API calls instead of mock state
- Use React Context or Redux for shared state (theme, auth, user profile)

---

### No Offline Support

**Current capacity:**
- Prototype assumes always-online; no sync queue for messages or events
- Refresh clears all state

**Limit:**
- Mobile users on weak connections will see UI lock up while Bedrock / AppSync calls are in flight
- Airplane mode or network flicker will cause screens to hang

**Scaling path:**
- Add loading/error/offline states to every screen (SKILL.md 1.3 requirement)
- Implement AppSync offline client (built-in to Amplify Gen 2)
- Store recent practice runs, reflections, and messages locally; sync when online
- Test: dev tools Network throttle to "Slow 3G" and verify UI responds

---

### No Rate Limiting or Cost Control

**Current capacity:**
- No per-user rate limit on Bedrock calls (practice, tone check, classification)
- No budget alarm setup (SKILL.md 1.4 requires this before first Bedrock call)

**Limit:**
- Single user could spam practice feedback calls and incur high costs
- No protection against bot attacks or mistaken loops

**Scaling path:**
- Add Lambda that checks DynamoDB counter table for calls-per-minute per user
- Set Bedrock reserved concurrency to 5–10 (prevent runaway)
- Add CloudWatch alarm on Bedrock throttles and errors
- Monthly budget alert at 50%, 80%, 100% to team email

---

### No Message Pagination or Archival

**Current capacity:**
- All past messages, events, and reflections are in memory (state)
- No limit on how many items are rendered

**Limit:**
- Circles with 100+ messages will slow down the UI
- DM list with 50+ contacts will not render efficiently

**Scaling path:**
- Paginate circles: load last 50 messages, "Load more" button
- Paginate DMs: show 20 most recent, search or scroll for older
- Archive old events (older than 1 year) to a separate table
- Use AppSync subscriptions for new messages (never polling the full history)

---

## Dependencies at Risk

### React 18 Deprecations

**Risk:** The App uses class components (`extends React.Component`) and `setState()`. Modern React pushes toward functional components and Hooks. Eventually, class components may be deprecated or moved to a legacy package.

**Impact:**
- Future React 19+ may drop class component support entirely
- Tool ecosystem (testing libraries, linters) increasingly assumes function components + hooks

**Migration plan:**
- Convert to function components with `useState()` as part of component splitting (Fragile Areas section)
- Use `useReducer()` for complex state instead of one massive `this.state` object

---

### Figma Make Platform Lock-in

**Risk:** The prototype is built in Figma Make, which is a proprietary tool. If Figma Make is discontinued or pricing changes, exporting to a standalone React app is necessary.

**Current setup:** Code is in `figma-make/src/App.tsx` and manually synced to Figma Make (copy/paste, per `FIGMA_MAKE_CONTEXT.md`)

**Mitigation:** The code is already in git; export is just a copy-paste to any Vite project.

**Recommendations:**
- Keep `figma-make/src/App.tsx` and `index.css` as the source of truth
- Test exported code in a standalone Vite project weekly to ensure no Figma Make-specific dependencies
- Plan: once Amplify backend is live, migrate to Amplify Hosting (no Figma Make needed)

---

## Missing Critical Features

### No Accessibility Testing

**What's missing:** No screen reader tests, keyboard navigation tests, or color contrast verification. SKILL.md 3 requires 44px tap targets and accessible labels, but no automated testing.

**Files:** `figma-make/src/App.tsx` (scattered `aria-label`, `role` attributes) and `src/index.css` (no contrast ratios verified)

**Blocks:** Code review (Nov 7–9 requirement). Accessibility violations will be caught by reviewers but may not be caught automatically.

**Priority:** High. First Place AZ's residents are neurodivergent; accessibility is core to the mission.

**Fix approach:**
- Run Lighthouse accessibility audit and axe DevTools on every screen
- Test with screen reader (VoiceOver on Mac)
- Verify keyboard-only navigation (Tab, Enter, arrows)
- Ensure calm mode (no animations) is tested

---

### No Moderation or Reporting Workflow

**What's missing:** Users can tap "Report" on messages and create a Report record, but there's no dashboard or workflow for the team to review. SKILL.md 2.4 says "moderator will check this chat", but no moderator role or queue exists.

**Files:** `figma-make/src/App.tsx` (Report button, unseen) and no data schema for Report yet

**Blocks:** Deployment. Without moderation, unsafe content (money requests, abuse) won't be actioned.

**Priority:** High (must-work for Nov 6).

**Fix approach:**
- Define Report schema in Amplify (reason, message ID, reporter ID, timestamp, status)
- Build admin Lambda to list open reports
- Plan dashboard post-launch if First Place AZ will monitor themselves; otherwise delegate to a moderation service

---

### No Web Push or SMS Notifications

**What's missing:** Reminders (event, daily check-in) and urgent notifications (I need help, new message) require push or SMS. Prototype shows fixed demo notifications; no real delivery.

**Files:** `figma-make/src/App.tsx` (Notifications screen, mock data) and no Lambda for push yet

**Blocks:** Feature is stretch goal (SKILL.md 2.6), so not required for Nov 6. But "I need help" must work, which implies trusted person must be notified *somehow*.

**Priority:** Medium (stretch; required only if "I need help" goes live).

**Fix approach:**
- Use Amplify Notifications (uses Pinpoint under the hood)
- Store VAPID keys in Amplify Secrets
- Lambda triggered by DynamoDB stream on Notification insert
- Test with a real device and Firebase Cloud Messaging

---

### No Bias Testing Results Integration

**What's missing:** SKILL.md 2.6 lists "bias-probe results on a slide (run Wed)" as a stretch goal. `scripts/bias_probe.py` exists but output is not fed back into the app. If bias is detected, the system should adjust or flag it.

**Files:** `scripts/bias_probe.py` (exists but output not integrated) and prompts not updated based on results

**Blocks:** Stretch goal, not required.

**Priority:** Low (nice-to-have for demo; tie feedback to SKILL.md section 2.10 "Evidence").

---

## Test Coverage Gaps

### Entire Prototype Has No Unit or Integration Tests

**What's not tested:**
- Event creation state machine (can you clash with an existing event?)
- Date/time parsing and formatting (off-by-one errors in event when times?)
- Tone-check word matching (case sensitivity, punctuation)
- Circle chat pagination (if many messages, does it render?)
- RSVP tracking (does "Going" persist if you navigate away and back?)
- Guardian link flow (can you accept then view what guardian sees?)

**Files:** No test files found in the repo (`*.test.ts`, `*.spec.ts`, `jest.config.ts`, `vitest.config.ts` all missing)

**Risk:**
- Changes to event logic may silently break RSVP counting
- Refactoring tone check or date formatting can introduce regressions
- Code review (Nov 7–9) will manually check logic, but automated tests are missing

**Priority:** High.

**Plan:**
- Add Jest or Vitest config
- Test date helpers (once extracted)
- Test tone-check word matching with a table of cases
- Test event creation workflow (step transitions, field validation)
- Target: 50%+ coverage before Nov 7 code review

---

*Concerns audit: 2025-11-03*
