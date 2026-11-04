# Testing Patterns

**Analysis Date:** 2026-11-03

## Test Framework

**Runner:**
- Not detected; no test framework installed or configured

**Assertion Library:**
- Not applicable; no testing infrastructure present

**Run Commands:**
- None defined; no test scripts in package.json or build config

## Test File Organization

**Location:**
- No test files found (`*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.js` searches returned 0 results)

**Naming:**
- Not applicable

**Structure:**
- Not applicable

## Test Structure

**Current State:**
- Component testing is manual/visual only
- No automated test suite
- Component state validation occurs via UI interaction in browser

**Patterns:**
- None established; no test infrastructure

## Mocking

**Framework:**
- Not applicable; no testing library integrated

**Patterns:**
- Manual state mocking in component: `BridgeBase.renderVals()` builds complete mock data structures
  - `dmData`: mock direct message conversations with canned responses
  - `circleData`: mock circles (Gaming, Music, Anime, Cooking, Art, Tech) with mock users
  - `scripts`: practice scenarios with mock opener, responses, and feedback
  - `baseEvents`: mock events with mock attendees and details
  - `profVals`: mock profile data (Sam Rivera)
- Mock data persists in component state (`this.state`)
- No randomization; deterministic mock values

**What to Mock (if tests were added):**
- State transitions (screen changes, form inputs)
- Time-based behaviors (setTimeout in toast notifications)
- Local Storage (if persistence were added)

**What NOT to Mock:**
- React rendering (should test actual DOM output)
- Event handlers (should test real user interactions)
- Validation logic (should test actual rules)

## Fixtures and Factories

**Test Data:**
- Mock data embedded in `renderVals()`:
  ```javascript
  var circleData = {
    gaming: { name: 'Gaming', initial: 'G', tint: '#F9DCE4', here: 3, topic: 'What game got you hooked?',
      m1: ['Maya', 'Animal Crossing! I loved building my island slowly.'], m2: ['Jordan', 'Zelda for me. I still get lost exploring every corner.'],
      ask: 'Jordan, what part of Zelda are you on right now?', share: 'Mine was Minecraft. I could build for hours. What got you hooked?',
      askReply: 'Just reached the Water Temple! Want to play co-op on Friday?', shareReply: 'Minecraft is the best! Want to build something together on Friday?' },
    music: { name: 'Music', initial: 'M', tint: '#E3E0F8', here: 5, topic: 'What song is stuck in your head?', ... },
    // ... 4 more circles
  };
  ```
- Mock scenarios in `scripts` object (~9 practice conversation scenarios with good/vague response pairs)
- Mock events in `baseEvents` array (4 events with attendees, times, venues)
- Mock profile: `pFirst: 'Sam'`, `pLast: 'Rivera'`, `pEmail: 'sam.rivera@email.com'`
- Mock DMs: `dmData` with 3 conversations (Jordan, Maya, Priya) with message history

**Location:**
- All mock data collocated in `renderVals()` method of `/Users/hero4440/Documents/Code/neuro/figma-make/src/App.tsx` (lines 170–450)
- No separate fixtures directory

## Coverage

**Requirements:**
- Not enforced; no coverage tracking tools installed

**View Coverage:**
- Not applicable

## Test Types

**Unit Tests:**
- Not present
- If added: should test individual decision functions like `evalOwn()` (harsh word detection, word counting, sentiment)

**Integration Tests:**
- Not present
- If added: should test state transitions (screen navigation, RSVP toggle, DM send + simulated reply)

**E2E Tests:**
- Not applicable; no browser automation setup
- Manual testing via Figma preview or browser dev tools

## Common Patterns

**Async Testing:**
- Handled via `setTimeout()` callbacks:
  ```javascript
  setTimeout(function () {
    if (self.state.undoToken === token) self.setState({ uiToast: '', undoPatch: null, undoToken: 0 });
  }, 5000);
  ```
- No async/await; callbacks used for all delayed operations (toast auto-dismiss, simulated reply delay)
- Token-based deduplication prevents state stale-ness

**Error Testing:**
- No error testing patterns observed
- Component assumes valid state and user actions
- No error boundaries or error recovery logic

**Validation Testing:**
- Implicit in state update functions:
  ```javascript
  var evalOwn = function (t) {
    var harsh = harshList.filter(function (w) { return low.indexOf(w) >= 0; })[0] || '';
    var words = t.trim() ? t.trim().split(/\s+/).length : 0;
    var asks = t.indexOf('?') >= 0;
    var kind = /(thank|sorry|no worries|...)/.test(low);
    return { harsh: harsh, words: words, asks: asks, kind: kind, good: !harsh && words >= 4 && (asks || kind) };
  };
  ```
  - Checks for harsh words, minimum word count, questions, kind tone
  - Returns detailed breakdown instead of boolean (allows detailed feedback)

## Bridge Hooks Script Testing

**`bridge-hooks.mjs` (system/CLI testing):**

**Entry points:**
- `log-prompt`: logs user prompts to markdown files
- `guard-push`: blocks unsafe git pushes

**Manual validation patterns:**
- Git safety: `guard-push()` checks:
  - Local branch not behind remote: `commitsBehind()` fetches and counts commits
  - Not force-pushing main: regex check on command line
  - No secrets in diff: `scanOutgoing()` scans added lines for credential patterns
- Prompt redaction: `redact()` replaces strong secrets before logging
- Identity resolution: `resolveUser()` tries multiple fallbacks (explicit, env var, git config email, git config name)

**No automated tests; validation by:**
- Manual push attempts and verification
- Manual prompt logging and file inspection
- Team members confirming correct user attribution

---

*Testing analysis: 2026-11-03*
