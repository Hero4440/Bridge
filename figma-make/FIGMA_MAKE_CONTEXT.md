# Bridge – Figma Make prototype context

This folder holds the code for the live Bridge prototype in Figma Make. Give this file to a new chat, or to Figma Make's AI, before asking for changes.

- **Figma Make file:**[ https://www.figma.com/make/CmV9IOc2bubFxzcPJzz4Q7](https://www.figma.com/make/nNkx4mz0eXrSNIZtCBuxRK/Bridge-Independence-App--2-?fullscreen=1&t=tACKsiQToNSxPhRR-1&code-node-id=0-6) ("Bridge Independence App")
- **User flows (Figma design file):** https://www.figma.com/design/tipYMvE4FisuZCNeKZD8ZK, on the "User flows" page
- **Last updated:** Nov 4, 2026

## What Bridge is
Bridge is an AI social coach for neurodivergent young adults, built for First Place AZ in the North American AI Challenge for Neurodiverse Learning. It helps users make and keep friends through interest-based Circles. **Mo**, a soft blob AI buddy, helps in three ways:
- Practice role-play.
- Reply ideas, a tone check and pause-before-send.
- Calm-down and help when the user needs it.

## Files in this folder
| File | Goes to (in Figma Make) | Notes |
|---|---|---|
| `src/App.tsx` | `src/App.tsx` | The whole app (~100 KB). Starts with `// @ts-nocheck`. |
| `src/index.css` | `src/index.css` | Outfit font, animations (breathe, floaty, rise), and phone/laptop fitting. |

Don't change `main.tsx`, `package.json`, `vite.config.ts` or `.figma/` in Make.

## How to update the Make prototype
Figma Make's automatic code import is blocked from Claude's cloud environment, so updates are copy and paste:
1. In Make, open code view and go to `src` → `App.tsx`.
2. Press Cmd+A, then Delete, then paste the new `App.tsx`.
3. Do the same for `index.css` if it changed.
4. Reload the preview, or refresh the browser tab if it still shows the old version.

## Code structure (App.tsx)
- **Classes:** plain React class components, no other libraries.
  - `DCLogic`: base class. `render()` returns `this.renderView(this.renderVals())`.
  - `Mo`: the SVG blob. Props are `mood` (happy, worried or calm) and `size`.
  - `Bridge`: the app. `BridgeBase.renderVals()` builds every value from `this.state`, and `Bridge.renderView(v)` draws the screens as `{v.isX && (...)}` blocks.
  - `App`: wraps it in `.stage > .phone`.
- **Navigation:** the `state.screen` value decides what shows. Possible values:
  - Main tabs: `home`, `circles`, `circle`, `me`
  - Messages and notifications: `dm`, `notifs`
  - Events: `event`, `newEvent`
  - Mo and practice: `practice`, `feedback`, `win`, `pause`, `reset` (breather), `help`
  - First screen: `checkin`
- **Bottom nav:** a fixed-width dark pill contains Home, Circles and Me; only the active label appears. Messages are the second view inside Circles. Mo is a separate floating button beside the pill and opens its Practice / Breathe / Help menu. Events open from Home. The nav is hidden on pause, reset, win, check-in, help and event-creation screens.
- **Logic sections in `renderVals()`:** Events, Event detail (what to expect, prep, reflection, connect), Profile, DMs, Notifications, Themes. Each returns an object merged into the final `Object.assign(...)`.
- **Themes:** colors are CSS variables set on `.bridge-app` from `state.theme`:
  - `--bg` (gradient), `--ink` (primary/dark), `--soft` (light chips), `--muted` (secondary text).
  - Production themes are Dawn (default), Sage, Mist, Sand, Berry and Honey. Apply the choice at the app root so every screen inherits it; use `var(--ink)` and the other variables instead of fixed theme colors.
  - SVG icons use `style={{stroke: "var(--ink)"}}`, because the `stroke` attribute doesn't read CSS variables.
- **Screen fitting:** on screens 500px wide or narrower, the app fills the screen and keeps 50px clear at the top for the notch. On wider screens it shows as a centered 390×844 phone.
- **Scroll reset:** `componentDidUpdate` scrolls `.bridge-scroll` back to the top when the screen changes.

## First-time setup
Show Welcome once, followed by four focused steps:
1. Required first and last name. Other users see only the first name.
2. Interests, including a custom option.
3. Trusted contact: name, phone, optional email and relationship.
4. Theme, text size, calm mode, chat preference and safety acknowledgement.

Email comes from Cognito; photo and gender remain optional profile settings. In production, creating the owner's `User` row marks setup complete, so returning users skip it. Contact details live only in owner-authorized `TrustedContact`, not on the authenticated-readable profile, and saving them never sends an SMS.

## Features by tab
**Check-in (first screen).**
- Questions: how you're feeling (Overwhelmed / Okay / Ready to connect), what's coming up, and what feels hardest.
- The answers decide how many practice cards Home shows (1 / 2 / 3) and the level.

**Home.**
- Header: "Hi {first name}", brave steps, and a 🔔 bell with an unread badge.
- Then the check-in summary, Mo's line, and the "Tonight in Gaming" card.
- Then a reflection nudge: "How was Minecraft build night?"
- **My plans:** only events the user is going to or hosting, plus "+ Create".
- **Practice made for you.**

**Circles.**
- Two segments: **Circles | Messages**.
- **Circles:** filters (For you / All / Quiet ones), then circle cards with Join or Just read.
- **Inside a circle:**
  - Event strip with "I'm in", Details, and "+ Plan an event".
  - Chat with a Message link next to names.
  - Mo reply ideas, a tone check and pause-before-send.
  - An unsafe message (Alex asking for money) triggers a private warning with Report/Block.
- **Messages:**
  - DMs with Jordan, Maya and Priya. You can type, Mo gives reply ideas, and a harsh-word check offers Say it gently / Send anyway.
  - Message requests: Alex's unsafe request is held by Mo, with Report and block / Delete.

**Event details.**
- **What to expect:** people, sound, lighting, and what to do if you need a break. Shows who's going and an RSVP button.
- **Get ready with Mo:** a practice for the event plus a prep checklist.
- **Past event:** a private reflection (+1 brave step), then Stay in touch: Message, or Say hi to send a message request.
- **Create event:** host in a circle or outside circles; choose what, when, where, sound, lighting, and size or invites. In-person events show Mo's safety tip and "Tell Mom where I'll be". Check the preview, then create.

**Notifications.**
- Grouped into New and Earlier. Tapping one goes to its screen.
- "Pause notifications for 1 hour".

**Mo explains why (new).** The tone check in circle chat, the pause screen and DMs now say which word caused the warning and why.

**Me.**
- **Profile:** photo upload, plus first name, last name, gender and email with Edit/Save. In circles, people see only the first name and photo.
- **Coach Maria connect request:** the user accepts and chooses what she sees, or declines.
- **Theme picker:** small gradient circles in tiles (Dawn, Sage, Mist, Sand, Berry, Honey); the choice affects every screen.
- **Comfort:** text size, calm mode and chatting preference, plus "Change my interests and trusted person".
- **My journey:** brave steps per week (bar chart) and stats (demo numbers).
- **Account:** after Settings, show Log out and Delete profile. Deletion requires confirmation and removes the profile, preferences, trusted contact and photo; the Cognito login, messages and events remain.
- Also: badges, a support circle list (no toggles), and a 988 note.

**Floating Mo button beside the nav.** Practice with me, Breathe with me (one-minute breather), I need help (choose a linked app user or 988; never auto-text a saved contact).

## Production direction
The current production UI is React + Vite. The planned target is a single Expo + React Native app for iOS and web, sharing Amplify and domain code and replacing Vite only after parity. Do not create a separate SwiftUI app or two permanent UI layers. The operating system owns status-bar time and icons; do not render fake system chrome.

## Demo data
- **Circles:** Gaming, Music, Anime, Cooking, Art, Tech. Members include Maya, Jordan, Lee, Priya, Ava, Kai, Ben, Rosa, Mia, Theo, Raj and Zoe.
- **Events:**
  - Co-op game night (Gaming, online)
  - Sketch and chill (Art, Tempe library)
  - Coffee with Jordan and Maya (outside circles; the user is going by default)
  - Playlist swap (Music, text only)
  - Past: Minecraft build night
- **Practice scenarios:** joinin, onread, cancel, leave, repair, invite, disagree.

## Design rules (team preferences)
- **Look:** calm, soft and rounded. Outfit font, large tap targets (44px or more), and a dark pill nav with fixed-width tabs.
- **Avoid:** childish or overly colorful styles, clutter, toggles in the support circle, and a nav that changes width between pages.
- **Mo's tone:** kind, short and never judgmental. Safety warnings are private ("Only you can see this").
- **Process:** don't invent features without saying so, and keep the Figma user flows in sync with the prototype.

## Known gaps (prototype only)
- State (theme, RSVPs, messages) resets when the page reloads.
- Safe message requests (accept/decline) aren't built. "Say hi" only shows "Request sent".
- Notifications are fixed demo items.
- Older Figma user-flow screens may still show the previous Home and setup order; the decisions above take precedence.
- Mo's responses are scripted only in this prototype; production uses the real AWS path and must not copy the scripted replies.
