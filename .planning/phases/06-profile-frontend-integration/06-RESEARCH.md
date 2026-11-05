# Phase 6: Profile & Frontend Integration — Research

**Research Question:** What do I need to know to PLAN this phase well?

**Conducted:** 2026-11-04  
**Requirements:** PROFILE-01, PROFILE-02, PROFILE-03, PROFILE-04, FRONTEND-01, FRONTEND-02, FRONTEND-03, FRONTEND-04, FRONTEND-05, FRONTEND-06, FRONTEND-07, FRONTEND-08

---

## 1. Figma Prototype Analysis

### Structure Overview
**File:** `figma-make/src/App.tsx` (2190 lines, `@ts-nocheck`)

**Architecture:**
- **Base classes:** `DCLogic` → `BridgeBase` → `Bridge` (single monolithic class component)
- **State management:** Single `this.state` object with ~50 properties (screen, onbDone, interests, trusted, ciFeel, draft, etc.)
- **Routing:** State-based (`this.state.screen`) — no React Router
- **Screens:** Inline `renderView()` methods with conditional rendering based on `screen` value

**Key Components (functional, reusable):**
1. **Mo** — SVG buddy with 3 moods (happy/worried/calm), 160px default, renders gradient fills
2. **StatusBar** — iOS-style 32px top bar with time + signal/wifi/battery icons
3. **PersonAvatar** — Circular initials, dynamic size/tint, button or span
4. **CircleGlyph** — Rounded square icons for interest groups (gaming/music/anime/cooking/art/tech)
5. **DateTile** — Event date display (day + date number)
6. **MapThumb** — Static SVG map illustration
7. **BadgeMark** — Badge icons (hello/kind/pause/event) with gradients
8. **MeSubHeader** — Settings screen header (back button + title)

**State Management Pattern:**
```javascript
// From BridgeBase.renderVals()
var changeWithUndo = function(patch, message, undoPatch) {
  // Updates state + shows toast with undo button for 5s
};
var saveQuietly = function(patch, message) {
  // Updates state + shows brief toast (1.8s, no undo) for settings
};
var notify = function(message) {
  // Toast only, no state change
};
```

**Screens (by state.screen value):**
- `onboard` (5 steps: welcome → interests → meet Mo → trusted person → comfort)
- `checkin` (feeling + what's coming up + what's hardest)
- `home` (summary, events, reflection nudge, practice cards)
- `circles` (filter tabs, daily topic, starter chips, chat)
- `circleChat` (live messages, composer, tone check, reply ideas)
- `events` (filter tabs, event cards by date)
- `eventDetail` (preview, RSVP, prep checklist, venue, exit plan)
- `createEvent` (3-step wizard with progress bar)
- `practice` (scenario picker, L1/L2/L3 levels, chat with Mo)
- `reset` (1-minute breather, Mo calm animation)
- `reflect` (event picker, feeling + wins taps, Mo reply, stay-in-touch)
- `me` (profile header, journey preview, badges, settings list)
- `meJourney`, `meBadges`, `meInterests`, `meTrusted`, `meTheme`, `meSettings`, `meNotifications` (sub-screens)
- `dms` (request list + active threads)
- `dmThread` (chat UI with safety warnings)

**Data:** All hardcoded in `renderVals()` — `circleData`, `drafts`, `scenarios`, etc. No API calls.

**Key Findings:**
1. **No separation of concerns:** All screens in one 2190-line render method
2. **State explosion:** ~50 state properties managed manually
3. **No data persistence:** Everything resets on refresh (FRONTEND-03 violation)
4. **Inline event handlers:** Logic mixed with JSX
5. **Reusable components exist:** Mo, avatars, glyphs, status bar are clean and extractable
6. **CSS classes are production-ready:** `.tab-screen`, `.event-row-card`, `.onb-*`, etc. (from index.css)

---

## 2. Component Extraction Strategy

### Class → Functional Conversion

**Pattern from prototype:**
```javascript
// Prototype (class)
class Bridge extends BridgeBase {
  renderVals() {
    var s = this.state;
    var screen = s.screen || 'home';
    return { screen, ... };
  }
  renderView(v) {
    return v.screen === 'home' ? <div>Home</div> : ...;
  }
}
```

**Production pattern (functional + hooks):**
```typescript
// app/src/screens/Home.tsx
export function Home() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await listEvents();
        setEvents(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorRetry error={error} onRetry={load} />;
  
  return (
    <div className="tab-screen">
      <StatusBar />
      <div className="tab-sticky-header">
        <h1 className="tab-page-title">Home</h1>
      </div>
      <div className="tab-screen-content">
        {events.map(e => <EventCard key={e.id} event={e} />)}
      </div>
      <NavBar />
    </div>
  );
}
```

### File Organization

**Recommended structure:**
```
app/src/
  components/     # Reusable UI (extracted from prototype)
    Mo.tsx        # SVG buddy component (copy from prototype)
    StatusBar.tsx # iOS status bar (copy from prototype)
    NavBar.tsx    # Bottom navigation (NEW, not in prototype)
    PersonAvatar.tsx
    CircleGlyph.tsx
    DateTile.tsx
    MapThumb.tsx
    BadgeMark.tsx
    LoadingSpinner.tsx   # NEW
    ErrorRetry.tsx       # NEW
    EmptyState.tsx       # NEW
  
  screens/        # Page-level components (one per screen)
    Login.tsx     # NEW (auth flow)
    Signup.tsx    # NEW
    Onboarding.tsx
    CheckIn.tsx
    Home.tsx
    Circles.tsx
    CircleChat.tsx
    Events.tsx
    EventDetail.tsx
    CreateEvent.tsx
    Practice.tsx
    Reset.tsx
    Reflect.tsx
    Me.tsx        # Profile/settings hub
    MeJourney.tsx
    MeBadges.tsx
    MeInterests.tsx
    MeTrusted.tsx
    MeTheme.tsx
    MeSettings.tsx
    Dms.tsx
    DmThread.tsx
  
  lib/            # API layer (already built)
    auth.ts       # ✓ Done (Phase 1)
    data.ts       # ✓ Done (Phase 3)
    rsvp.ts       # ✓ Done (Phase 3)
    messages.ts   # ✓ Done (Phase 4)
    dm.ts         # ✓ Done (Phase 5)
    safety.ts     # ✓ Done (Phase 5)
    reflection.ts # ✓ Done (Phase 3)
    prep.ts       # ✓ Done (Phase 3)
    chips.ts      # ✓ Done (Phase 4)
    topics.ts     # ✓ Done (Phase 4)
    connection.ts # ✓ Done (Phase 4)
    profile.ts    # NEW (Phase 6 — User CRUD + S3 photo)
  
  App.tsx         # Top-level router (auth check → Onboarding vs Main)
  main.tsx        # Entry point (Amplify.configure already called)
  index.css       # Copy from figma-make/src/index.css (production-ready)
```

**Extraction order (recommended for planning):**
1. **Infrastructure first:** App.tsx router, LoadingSpinner, ErrorRetry, EmptyState
2. **Reusable components:** Copy Mo, StatusBar, PersonAvatar, CircleGlyph, etc. from prototype
3. **Auth screens:** Login, Signup (wire to lib/auth.ts)
4. **Profile lib:** lib/profile.ts (User CRUD + S3 upload)
5. **Core screens:** Home, Me (wire to lib/profile.ts)
6. **Remaining screens:** Onboarding, Events, Circles, etc. (wire to existing libs)

---

## 3. Existing Lib Layer Patterns

### Pattern 1: Single Data Client per File
**File:** `app/src/lib/data.ts`

```typescript
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>(); // ONCE per file

export type EventRecord = Schema['Event']['type'];
export type CreateEventInput = Parameters<typeof client.models.Event.create>[0];
// Typed inputs extracted from the client, not manually defined
```

**Key insight:** Never call `generateClient()` in a function — call it once at module scope. Schema is the source of truth for types.

### Pattern 2: Throw on Errors
```typescript
export async function createEvent(input: CreateEventInput): Promise<EventRecord> {
  const { data, errors } = await client.models.Event.create(input);
  if (errors?.length) throw new Error(`createEvent failed: ${JSON.stringify(errors)}`);
  if (!data) throw new Error('createEvent returned no data');
  return data;
}
```

**Key insight:** Amplify returns `{ data, errors }` — always check both. Throw on errors so screens can catch and show error states. Never return null/undefined silently.

### Pattern 3: Auth Thin Wrapper
**File:** `app/src/lib/auth.ts`

```typescript
export const authSignUp = (email: string, password: string) =>
  signUp({ username: email, password, options: { userAttributes: { email } } });

export const authSignIn = (email: string, password: string) =>
  signIn({ username: email, password });

export const currentUser = () => getCurrentUser();
```

**Key insight:** No error handling in lib — screens handle the try/catch. Lib just re-exports with cleaner signatures.

### Pattern 4: Subscription Pattern (messages)
**File:** `app/src/lib/messages.ts` (from Phase 4)

```typescript
export function observeMessages(groupId: string, callback: (messages: MessageRecord[]) => void) {
  const sub = client.models.Message.observeQuery({
    filter: { groupId: { eq: groupId } }
  }).subscribe({
    next: ({ items }) => callback(items),
    error: (err) => console.error('observeMessages error:', err)
  });
  return sub; // Caller must .unsubscribe() on unmount
}
```

**Key insight:** Subscriptions return an object with `.unsubscribe()` — screens must clean up in `useEffect` return.

### Pattern 5: Owner Authorization (from schema)
**File:** `app/amplify/data/resource.ts`

```typescript
PracticeRun: a.model({
  userId: a.string(),
  // ...
}).authorization((allow) => [allow.ownerDefinedIn('userId').identityClaim('sub')]),
```

**Key insight:** Owner-only models (Reflection, PracticeRun) require explicit `userId` field set by Lambda. Client can't write directly — must go through custom mutation. Public-read models (Event, RSVP) use `allow.owner(), allow.authenticated().to(['read'])`.

---

## 4. Profile Persistence (NEW)

### User Model Structure
**From:** `app/amplify/data/resource.ts`

```typescript
User: a.model({
  email: a.string().required(),
  firstName: a.string(),
  lastName: a.string(),
  interests: a.string().array(),
  trustedPersonName: a.string(),
  trustedPersonRelation: a.enum(['Parent', 'Sibling', 'Friend', 'Other']),
  theme: a.enum(['dawn', 'sage', 'mist', 'sand']),
  comfortTextSize: a.string(),
  comfortCalmMode: a.boolean(),
  comfortTextFirst: a.boolean(),
}).authorization((allow) => [allow.owner(), allow.authenticated().to(['read'])]),
```

**Missing field:** `photoKey: a.string()` — must be added to schema (PROFILE-03).

### Profile Lib Pattern (NEW file)
**File:** `app/src/lib/profile.ts` (to be created)

```typescript
import { generateClient } from 'aws-amplify/data';
import { uploadData, getUrl } from 'aws-amplify/storage';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export type UserRecord = Schema['User']['type'];
export type CreateUserInput = Parameters<typeof client.models.User.create>[0];
export type UpdateUserInput = Parameters<typeof client.models.User.update>[0];

// Get current user's profile (owner query)
export async function getCurrentUserProfile(): Promise<UserRecord | null> {
  const { data, errors } = await client.models.User.list();
  if (errors?.length) throw new Error(`getCurrentUserProfile failed: ${JSON.stringify(errors)}`);
  return data[0] || null; // Owner filter returns max 1 row
}

// Create profile (first save, onboarding complete)
export async function createUserProfile(input: CreateUserInput): Promise<UserRecord> {
  const { data, errors } = await client.models.User.create(input);
  if (errors?.length) throw new Error(`createUserProfile failed: ${JSON.stringify(errors)}`);
  if (!data) throw new Error('createUserProfile returned no data');
  return data;
}

// Update profile (settings changes)
export async function updateUserProfile(input: UpdateUserInput): Promise<UserRecord> {
  const { data, errors } = await client.models.User.update(input);
  if (errors?.length) throw new Error(`updateUserProfile failed: ${JSON.stringify(errors)}`);
  if (!data) throw new Error('updateUserProfile returned no data');
  return data;
}

// Upload photo to S3, return key
export async function uploadPhoto(file: File): Promise<string> {
  // Validate
  if (file.size > 5 * 1024 * 1024) throw new Error('Photo must be under 5MB');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Photo must be JPEG, PNG, or WebP');
  }
  
  const key = `profile-photos/${Date.now()}-${file.name}`;
  const result = await uploadData({ key, data: file }).result;
  return result.key; // Store in User.photoKey
}

// Get photo URL from key
export async function getPhotoUrl(key: string): Promise<string> {
  const result = await getUrl({ key });
  return result.url.toString();
}
```

**Key decisions:**
1. **Lazy User row creation:** Check `getCurrentUserProfile()` on app load. If null → show Onboarding. First save creates the row.
2. **Photo validation client-side:** Max 5MB, MIME check before upload (PROFILE-03).
3. **S3 key storage:** Store `photoKey` (not URL) in DynamoDB. Construct URL on render with `getUrl()` (D-03 from CONTEXT).
4. **Owner binding automatic:** `allow.owner()` on User model means Cognito sub is matched automatically.

---

## 5. Theme & Settings Persistence

### CSS Variable Mapping (from UI-SPEC)
**Themes:** dawn (default), sage, mist, sand

**Implementation approach:**
1. **On page load:** Read `User.theme` from DynamoDB → apply CSS variables
2. **On theme change:** Apply CSS variables immediately (optimistic UI) → background `updateUserProfile()`
3. **CSS variables:** `--bg`, `--bar`, `--ink`, `--soft`, `--muted` (set on `document.documentElement.style`)

**Pattern:**
```typescript
// app/src/hooks/useTheme.ts (or inline in App.tsx)
const themes = {
  dawn: { bg: '#FFF9F6', bar: '#F5EDE8', ink: '#3B3350', soft: '#F9DCE4', muted: '#9D8FA3' },
  sage: { bg: '#F8FAF6', bar: '#E8F0E4', ink: '#3B3B3A', soft: '#DDF1E6', muted: '#8C9B8A' },
  mist: { bg: '#F6F8FA', bar: '#E4EAF0', ink: '#3B3350', soft: '#DCE4FA', muted: '#8F9AAA' },
  sand: { bg: '#FAF8F4', bar: '#F0EBE2', ink: '#3B3350', soft: '#F6E5C9', muted: '#A89B85' }
};

function applyTheme(themeName: 'dawn' | 'sage' | 'mist' | 'sand') {
  const t = themes[themeName];
  const root = document.documentElement.style;
  root.setProperty('--bg', t.bg);
  root.setProperty('--bar', t.bar);
  root.setProperty('--ink', t.ink);
  root.setProperty('--soft', t.soft);
  root.setProperty('--muted', t.muted);
}

// In MeTheme.tsx (settings screen)
async function handleThemeChange(newTheme: string) {
  applyTheme(newTheme as any); // Instant visual feedback
  await updateUserProfile({ id: user.id, theme: newTheme }); // Background sync
}
```

**Comfort settings (same pattern):**
- `comfortCalmMode` → add/remove `.calm-mode` class on root
- `comfortTextSize` → add/remove `.text-large` class on root
- Optimistic updates, background DynamoDB sync

---

## 6. Loading/Error States (Consistent Pattern)

### Pattern from CONTEXT D-06 + FRONTEND-07/08

**Every data-fetching screen:**
```typescript
function SomeScreen() {
  const [data, setData] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  async function load() {
    try {
      setLoading(true);
      setError(null);
      const result = await libCall();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => { load(); }, []);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorRetry error={error} onRetry={load} />;
  if (data.length === 0) return <EmptyState message="No items yet" />;
  
  return <div>{/* Render data */}</div>;
}
```

**Shared components (NEW):**
1. **LoadingSpinner** — 24px circular spinner, var(--ink) stroke, centered
2. **ErrorRetry** — `.why-box` card with ⚠ symbol, message, retry button
3. **EmptyState** — Centered text (var(--muted), 16px) + optional CTA button

**Key insight:** Every async lib call needs try/catch/finally. Loading state prevents flash of empty content. Error state gives user control (retry button). Empty state is distinct from error.

---

## 7. Screen Routing

### Prototype Approach (State-Based)
```javascript
// figma-make/src/App.tsx
var screen = s.screen || 'home';
// ...
return (
  <div className="bridge-app">
    {screen === 'home' && <HomeScreen />}
    {screen === 'circles' && <CirclesScreen />}
    {/* 20+ screens, all conditional renders */}
  </div>
);
```

**Pros:** Simple, no router dependency  
**Cons:** No URL history, no deep linking, manual state management

### Production Recommendation: Hybrid Approach

**Top-level auth routing (in App.tsx):**
```typescript
import { currentUser } from './lib/auth';

function App() {
  const [authState, setAuthState] = useState<'loading' | 'signedOut' | 'signedIn'>('loading');
  const [hasProfile, setHasProfile] = useState(false);
  
  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await currentUser();
        const profile = await getCurrentUserProfile();
        setHasProfile(!!profile);
        setAuthState('signedIn');
      } catch {
        setAuthState('signedOut');
      }
    }
    checkAuth();
  }, []);
  
  if (authState === 'loading') return <LoadingSpinner />;
  if (authState === 'signedOut') return <AuthFlow />; // Login/Signup
  if (!hasProfile) return <Onboarding />; // First-time setup
  return <MainApp />; // Home with NavBar routing
}
```

**NavBar routing (in MainApp, state-based):**
```typescript
function MainApp() {
  const [screen, setScreen] = useState<'home' | 'circles' | 'events' | 'dms' | 'me'>('home');
  
  return (
    <div className="bridge-app">
      <StatusBar />
      {screen === 'home' && <Home />}
      {screen === 'circles' && <Circles />}
      {screen === 'events' && <Events />}
      {screen === 'dms' && <Dms />}
      {screen === 'me' && <Me />}
      <NavBar currentScreen={screen} onNavigate={setScreen} />
    </div>
  );
}
```

**Why not React Router:**
1. Prototype doesn't use it (keep close to reference)
2. Simple tab navigation (5 screens) doesn't need full router
3. Auth flow + onboarding gate is cleaner with conditional rendering
4. Can add later if deep linking needed

---

## 8. Integration Risks & Mitigations

### Risk 1: Schema Drift
**Problem:** User model in `amplify/data/resource.ts` doesn't have `photoKey` field yet.  
**Mitigation:** Add `photoKey: a.string()` to User model before building profile screens. Run `npx ampx sandbox` to regenerate types.

### Risk 2: Owner Authorization on User Model
**Problem:** `allow.owner()` on User requires the row's `owner` field to match Cognito sub.  
**Mitigation:** First `createUserProfile()` call auto-sets owner. Subsequent `updateUserProfile()` calls work only for the owner. Test with two accounts to verify.

### Risk 3: S3 Bucket Not Configured
**Problem:** Amplify Storage may need explicit S3 bucket setup.  
**Mitigation:** Check `amplify/storage/resource.ts` exists. If not, add via `defineStorage()`. Verify IAM permissions for authenticated users.

### Risk 4: Subscription Memory Leaks
**Problem:** `observeMessages()` returns a subscription that must be cleaned up.  
**Mitigation:** In every screen using subscriptions, return cleanup from `useEffect`:
```typescript
useEffect(() => {
  const sub = observeMessages(groupId, setMessages);
  return () => sub.unsubscribe();
}, [groupId]);
```

### Risk 5: Prototype CSS Conflicts
**Problem:** Copying `figma-make/src/index.css` may conflict with existing `app/src/index.css`.  
**Mitigation:** Replace `app/src/index.css` entirely with prototype CSS. Verify no stale styles remain. Test all screens after copy.

### Risk 6: Mo Component SVG Rendering
**Problem:** Mo component uses inline gradients (`<defs>`) — multiple instances may conflict.  
**Mitigation:** Each Mo instance needs unique gradient IDs. Append random suffix or use React.useId() (React 18+).

### Risk 7: Theme Persistence Race Condition
**Problem:** User changes theme, then navigates before DynamoDB update completes.  
**Mitigation:** Optimistic update (CSS variables applied immediately) means visual state is correct even if background save fails. On next page load, DynamoDB is source of truth. Log errors but don't block UI.

### Risk 8: Empty State vs Loading State Confusion
**Problem:** Data fetching shows empty state before loading completes.  
**Mitigation:** Always check `loading` before checking `data.length === 0`. Order: loading → error → empty → data.

---

## 9. Testing Approach

### Unit Tests (lib layer)
**Files to test:**
- `lib/profile.ts` — Test CRUD functions with mocked client
- `lib/auth.ts` — Already thin wrapper, test sign-up/sign-in flow

**Pattern:**
```typescript
// lib/profile.test.ts
import { vi } from 'vitest';
import { getCurrentUserProfile } from './profile';

vi.mock('aws-amplify/data', () => ({
  generateClient: vi.fn(() => ({
    models: {
      User: {
        list: vi.fn(() => ({ data: [{ id: '1', email: 'test@example.com' }], errors: null }))
      }
    }
  }))
}));

test('getCurrentUserProfile returns first user', async () => {
  const user = await getCurrentUserProfile();
  expect(user).toEqual({ id: '1', email: 'test@example.com' });
});
```

### Integration Tests (screens)
**Approach:** Test with two signed-in accounts, verify:
1. Profile photo upload → S3 key stored → URL renders
2. Theme change persists across refresh
3. Loading states appear during fetch
4. Error states show retry button
5. Empty states show correct message

**Tool:** Playwright or Cypress (full browser, real Amplify backend via sandbox)

### Access Control Tests
**Critical:** Test with two accounts to verify owner-only access:
1. User A creates profile → User B cannot read it (owner-only)
2. User A creates Event → User B can read it (authenticated read)
3. User A uploads photo → User B cannot access S3 key directly

---

## 10. Dependencies & Prerequisites

### From Prior Phases (Already Complete)
- ✓ Phase 1: Auth (signUp, signIn, signOut, currentUser)
- ✓ Phase 3: Event CRUD, RSVP, Reflection, Prep
- ✓ Phase 4: Messages, Topics, Chips, Connection
- ✓ Phase 5: DMs, Safety (report, block, help)

### Required for Phase 6
1. **Schema update:** Add `photoKey: a.string()` to User model
2. **Storage setup:** Verify `amplify/storage/resource.ts` configures S3 bucket
3. **CSS copy:** Replace `app/src/index.css` with `figma-make/src/index.css`
4. **Type regeneration:** Run `npx ampx sandbox` after schema change
5. **New lib:** Create `app/src/lib/profile.ts` (User CRUD + S3 upload)

### External Dependencies (from package.json)
- `aws-amplify` (already installed, v6 API)
- `react`, `react-dom` (already installed)
- No new dependencies needed (no router, no UI library)

---

## 11. Open Questions & Decisions for Planning

### Q1: NavBar Implementation
**Question:** The prototype doesn't have a visible nav bar (uses state buttons). Production needs persistent bottom nav with 5 tabs (Home, Circles, Events, DMs, Me). Design from scratch or extract pattern?  
**Recommendation:** Create from UI-SPEC guidelines (44px height, pill shape, 5 icons, active state in var(--ink)). Not in prototype but required for FRONTEND-06.

### Q2: Onboarding State Persistence
**Question:** If user exits during onboarding (5 steps), should progress be saved?  
**Recommendation:** No. User row is created only on final save (step 5 complete). Partial onboarding is lost. This matches prototype behavior and keeps DB clean.

### Q3: Photo Upload Progress
**Question:** S3 upload can take seconds on slow connections. Show progress bar?  
**Recommendation:** Show loading spinner on upload button. No progress bar (complexity not in prototype). If upload fails, show error toast with retry.

### Q4: Theme Application Timing
**Question:** When user loads app, theme is fetched from DynamoDB. Apply before first render or allow FOUC?  
**Recommendation:** Show loading spinner until `getCurrentUserProfile()` completes. Apply theme before first render. No FOUC (flash of unstyled content).

### Q5: Empty State Copy Source
**Question:** UI-SPEC defines empty state copy. Are these final or placeholder?  
**Recommendation:** Use UI-SPEC copy as-is. All copy reviewed in SKILL.md §2.4 (prototype behavior). If user wants changes, they happen in a future phase.

### Q6: Login vs Signup Screen Split
**Question:** Prototype doesn't show auth screens. Single screen with toggle, or separate Login/Signup?  
**Recommendation:** Separate screens (cleaner, less cognitive load). Login shows "New here? Sign up" link, Signup shows "Have an account? Sign in" link.

---

## 12. Validation Architecture

**From SKILL.md §1.4 (AWS):**
- Every Lambda validates input (zod)
- Every Lambda checks authorization
- Every Lambda handles errors

**Phase 6 has no new Lambdas** — profile persistence uses client-side Data API. Validation happens client-side:

**Client-side validation (profile.ts):**
```typescript
export async function uploadPhoto(file: File): Promise<string> {
  // Max 5MB
  if (file.size > 5 * 1024 * 1024) throw new Error('Photo must be under 5MB');
  
  // MIME check
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Photo must be JPEG, PNG, or WebP');
  }
  
  // Upload
  const key = `profile-photos/${Date.now()}-${file.name}`;
  const result = await uploadData({ key, data: file }).result;
  return result.key;
}
```

**DynamoDB validation (Amplify Data):**
- Required fields enforced by schema (`email: a.string().required()`)
- Enum validation on `theme`, `trustedPersonRelation`
- Owner authorization on `User` model (automatic via Cognito sub)

**No server-side validation needed** — schema + client checks are sufficient for Phase 6.

---

## 13. Summary: Key Patterns for Planning

1. **Extract reusable components first** — Mo, StatusBar, PersonAvatar, CircleGlyph (copy from prototype)
2. **Build profile lib** — `lib/profile.ts` with User CRUD + S3 upload (follow data.ts pattern)
3. **Add photoKey to schema** — Required before profile screens work
4. **Consistent loading/error/empty** — Every screen follows the 3-state pattern
5. **Optimistic theme updates** — CSS variables change immediately, DynamoDB sync in background
6. **State-based routing** — No React Router, simple useState for tab navigation
7. **Lazy User row creation** — Check on app load, create on first save (onboarding complete)
8. **Throw on lib errors** — Screens catch and show error state with retry button
9. **Clean up subscriptions** — Return `sub.unsubscribe()` from useEffect
10. **Copy prototype CSS** — `figma-make/src/index.css` is production-ready, replace app CSS entirely

---

**Research complete.** Ready for planning.
