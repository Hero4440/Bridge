# Architecture

**Analysis Date:** 2026-11-03

## Pattern Overview

**Overall:** Single-file React class component with centralized state management and conditional screen rendering.

**Key Characteristics:**
- Monolithic component (`BridgeBase` class) handling all app state and logic
- Class-based React (no hooks) with `setState` for mutations
- Screen routing via state flag with conditional JSX rendering
- Pure functional UI components at leaf nodes (helpers for Mo, avatars, icons)
- CSS-first styling with CSS variables for theming and animations

## Layers

**Presentation Layer:**
- Purpose: Render UI and capture user interactions
- Location: `figma-make/src/App.tsx` (renderView method, lines 1114-2180)
- Contains: Screen-specific JSX, component composition, inline event handlers
- Depends on: State computed in renderVals() layer
- Used by: Browser DOM render pipeline

**State & Logic Layer:**
- Purpose: Compute derived state, validate inputs, orchestrate screen transitions
- Location: `figma-make/src/App.tsx` (renderVals method, lines 128-1098)
- Contains: State transformations, event handler creation, data filtering, UI flag calculation
- Depends on: Raw component state (this.state)
- Used by: renderView() to populate JSX props

**Base Components:**
- Purpose: Reusable UI elements and visual patterns
- Location: `figma-make/src/App.tsx` (functions and classes, lines 4-125)
- Contains: Mo (emoji-like avatar with mood states), avatars, icons, status bar, badges
- Pattern: Function components with prop styling, SVG paths as data
- Examples: `Mo`, `PersonAvatar`, `CircleGlyph`, `DateTile`, `BadgeMark`

**Styling Layer:**
- Purpose: Visual design, animations, responsive layout
- Location: `figma-make/src/index.css` (154 lines)
- Pattern: CSS variables for theming, BEM-like naming, utility classes
- Key variables: `--ink` (primary), `--bg` (background), `--soft` (accents), `--muted` (secondary text)
- Animations: breathe, floaty, rise, screenIn, screenBack, moHop, celebrate, typingDot, moThink

## Data Flow

**Check-in → Home Personalization:**

1. User completes onboarding (interests, trusted person, comfort settings)
2. Daily check-in captures feeling (Overwhelmed/Frustrated/Okay/Ready) + what's coming + what's hard
3. `renderVals()` uses `hardMap` and `upMap` to recommend 1-3 practice scenarios
4. Home screen displays recommended practice cards and next event with personalized Mo mood
5. User picks a practice level (Guided / Light help / On your own) → enters practice screen

**Circle Interaction Flow:**

1. User views circles tab (list filtered by "For you" / "All" / "Quiet ones")
2. Selects a circle → enters chat screen with daily topic
3. Chat shows: two starter chips (ask question, share story), previous messages, typing indicator for incoming
4. User sends message → message appears, Mo may respond with warm reply ideas
5. Practice recommendations emerge from circle interactions (based on ciHard + ciUp)

**Event Lifecycle:**

1. User creates event: 3-step wizard (what/when + format + comfort settings)
2. Event appears on home or circle feed with RSVP buttons (Going / Maybe / Can't go)
3. Going → event details screen showing sensory expectations (people, sound, lighting) + prep checklist
4. After event time passes → reflection screen (hard / okay / good + wins + Mo reply)
5. Reflection saves to state.refl[eventId] → appears in Me > My journey

**Tone Check Flow:**

1. User types DM in composer
2. `renderVals()` checks for harsh keywords (whatever, stupid, hate, etc.)
3. If harsh word found → dmHarsh flag true → UI shows warning with word explanation
4. User can tap "Say it gently" (replaces draft) or "Send anyway" (sends as-is)
5. Message sent regardless of choice, but logged with gentle flag

## Key Abstractions

**Screen System:**

- Purpose: Single-page routing without URL changes
- Pattern: `state.screen` string determines which conditional blocks render
- Example screens: onboard, checkin, home, circles, circle (chat), dm, events, practice, me, me-journey, me-profile, etc.
- Screen order defined in `order` map (lines 1107) for animation direction (back vs forward)

**Event & Circle Data Objects:**

- Purpose: Represent domain entities with computed UI properties
- Pattern: Built in renderVals() as mapped arrays with pick/open/toggle functions
- Example: `evCard()` transforms baseEvents into cards with tint, goingText, toggle handler, sense array
- Ensures: UI props computed once per render, event handlers capture current state via closures

**Practice Scenarios (`scripts` object):**

- Purpose: Define 7 conversation scenarios with levels L1/L2/L3
- Properties: title, group, scene, opener, hint, good/vague replies, stars (strengths), sparks (tips)
- Used by: Practice screen to show partner reply, level-specific hints, feedback
- Recommendation: `hardMap` and `upMap` select scenarios by check-in answers

**Undo/Redo Pattern:**

- Purpose: Reversible state mutations for settings and saves
- Pattern: `changeWithUndo(patch, message, undoPatch)` sets state + shows toast with Undo button
- Timeout auto-dismisses after 5 seconds; clicking Undo restores undoPatch
- Less critical: `saveQuietly()` for simple confirmations (no Undo)

## Entry Points

**App Root:**
- Location: `figma-make/src/App.tsx` line 2184-2190
- Renders: Wrapper div with phone frame → `<Bridge />` component
- Responsibilities: Provide top-level DOM structure for Figma Make context

**Bridge Component:**
- Location: `figma-make/src/App.tsx` line 127 (class definition)
- Responsibilities: Manage all state, compute UI data, orchestrate screen rendering
- Triggers: Initial mount → onboarding flow; daily return → check-in nudge; user actions → setState calls

**Screen Transitions:**
- Mechanism: `go(screen, extra)` function returns click handler that calls `setState({ screen: sc, ... })`
- Animation: CSS animation class applied based on order map (screenIn for forward, screenBack for backward)

## Error Handling

**Strategy:** Silent fallback with recovery hints; no error screens.

**Patterns:**

- Missing data: Use default values (e.g., `pScen = s.pScen || recKeys[0]`)
- Invalid selections: Filter to defaults (e.g., `evDate = s.evDate || 'SAT 8'`)
- Unsupported viewport: CSS media query hides status bar and phone frame on mobile
- Harsh words missing: Continue without tone check (fallback to rule-based evalOwn)

## Cross-Cutting Concerns

**Logging:** Console-based only in prototype; AI integration (Bedrock) logs will track sentiment/crisis/bias labels via `classify()` function per SKILL.md.

**Validation:**
- Input: Phone number format hints; email optional
- Practice replies: Rule-based scoring (harsh words, word count, questions, kindness signals)

**Authentication:** Not yet implemented; prototype assumes single user. Real build: Cognito via Amplify.

**Data Persistence:** `state` object mutated via `setState()`; no persistence to storage in prototype. Real build: DynamoDB via Amplify API.

**Accessibility:**
- ARIA labels on all buttons and interactive elements
- Tab navigation via semantic HTML buttons
- Status messages use `aria-live="polite"` for screen readers
- Respect `prefers-reduced-motion` by disabling animations in calm mode + media query

---

*Architecture analysis: 2026-11-03*
