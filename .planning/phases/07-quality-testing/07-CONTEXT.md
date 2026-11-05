# Phase 7 Context: Testing & Demo Prep (Nov 6 Focus)

**Created:** 2026-11-04  
**Phase Type:** Testing & validation before demo  
**Depends On:** Phase 6.1 (all core features complete)  
**Demo Date:** Nov 6, 2026 (Scottsdale Launchpad, 4-8 PM)

---

## Why This Phase Exists

Nov 6 demo is in **2 days**. We have all core features built, but need to:
1. Test everything works end-to-end
2. Seed demo data so app isn't empty
3. Test with 2 accounts (real-time features require it)
4. Verify no critical bugs
5. Practice the demo script

This phase focuses on **demo readiness**, not comprehensive QA (accessibility audits, bias probes, etc. deferred post-demo).

---

## What Already Works (Phase 1-6.1)

✅ **Backend (Phases 1-5):**
- Amplify Gen 2 infrastructure
- Cognito authentication
- DynamoDB schema (9 models)
- Lambda functions (practice, classify, tone, etc.)
- Bedrock integration
- AppSync subscriptions
- Safety checks (crisis detection)

✅ **Frontend (Phase 6):**
- Auth flow (Login, Signup, Onboarding)
- 5 main screens (Home, Circles, Events, DMs, Me)
- Profile persistence with S3 photos
- Real-time chat
- RSVP functionality
- Message requests with safety

✅ **Practice UI (Phase 6.1):**
- 7 scenarios with real AI feedback
- Strength + tip from Bedrock
- Crisis detection
- Loading states

---

## Key Decisions

### 1. Testing Scope

**Decision:** Focus on **smoke testing** and **demo flow**, not comprehensive QA

**What to test:**
- ✅ End-to-end user journey (signup → onboarding → all features)
- ✅ Practice with real AI (all 7 scenarios)
- ✅ Real-time features (Circles chat with 2 accounts)
- ✅ RSVP persistence across refresh
- ✅ Crisis detection works
- ✅ No console errors during demo flow

**What to defer post-demo:**
- Accessibility audit (Lighthouse, VoiceOver)
- TypeScript strict mode
- Bias probe on AI prompts
- Edge case testing
- Performance optimization

**Rationale:** 2 days until demo - focus on working demo, not perfect app.

---

### 2. Demo Data Seeding

**Decision:** Create seed script to populate demo data

**What to seed:**
- **Users:** 2 demo accounts (you + test partner for real-time)
- **Events:** 3-5 upcoming events (Gaming Night, Cooking Class, Anime Watch Party)
- **Circles:** 6 groups with 2-3 seed messages each
- **Topics:** Daily topics for each circle (cached)

**What NOT to seed:**
- Real user data (privacy)
- PracticeRun history (not implemented)
- Notifications (not critical for demo)

---

### 3. Two-Account Testing

**Decision:** Test real-time features with 2 browsers/accounts

**What to test:**
- Circles: Send message in Account A → appears in Account B instantly
- Events: Account A RSVPs → count updates for Account B
- DMs: Account A sends request → Account B accepts → thread works

**Setup:**
- Account 1: Your main demo account (fully onboarded)
- Account 2: Test partner account (minimal setup)

---

### 4. Demo Script

**Decision:** Write and practice 4-minute demo script

**Structure:**
1. **Intro (30 sec):** What is Bridge, who it's for
2. **Onboarding (30 sec):** Show 5 steps (fast-forward if needed)
3. **Practice (2 min):** THE STAR - show real AI feedback
4. **Social Features (1 min):** Circles, Events, DMs
5. **Safety (15 sec):** Crisis detection, 988
6. **Wrap-up (15 sec):** Impact, next steps

**Practice runs:** 3-5 times before demo day

---

### 5. Critical Bug Checks

**Decision:** Identify and fix showstoppers only

**Showstopper bugs:**
- App crashes on load
- Can't sign up or login
- Practice doesn't call Bedrock (returns error)
- Circles chat doesn't send messages
- RSVP doesn't save
- Crisis detection doesn't show 988

**Non-showstoppers (tolerate for demo):**
- Minor UI glitches
- Loading too slow (if under 10 seconds)
- Empty states not perfect
- Edge case errors

---

## Out of Scope (Post-Demo)

- Accessibility audit (Lighthouse 90+ score)
- VoiceOver screen reader testing
- Keyboard navigation audit
- Calm mode verification
- TypeScript strict mode
- Bias probe on AI prompts
- Guardian links UI
- Notifications UI
- Tone check UI integration
- Reply suggestions UI
- Reset/Breather screen
- Performance optimization
- Error boundary components
- Analytics/logging
- SEO optimization

---

## Success Criteria (What "Ready for Demo" Means)

1. ✅ Can create new account, complete onboarding, reach Home screen
2. ✅ Can practice all 7 scenarios and get AI feedback
3. ✅ Can join a circle, send message, see it in real-time (2 accounts)
4. ✅ Can RSVP to event, see count update, refresh persists
5. ✅ Can send/accept DM request, chat works
6. ✅ Crisis detection shows 988 alert
7. ✅ No console errors during demo flow
8. ✅ Demo data seeded (events, messages, topics)
9. ✅ Demo script practiced and timed (under 5 minutes)
10. ✅ Backup plan if Bedrock times out (fallback works)

---

## Files to Create/Modify

**Testing:**
- `scripts/test-demo-flow.md` - Manual test checklist
- `.planning/phases/07-quality-testing/07-TEST-RESULTS.md` - Test findings

**Seeding:**
- `scripts/seed/demo-data.ts` - Seed script for demo accounts, events, circles

**Demo:**
- `docs/DEMO-SCRIPT.md` - 4-minute demo script with timing
- `docs/DEMO-BACKUP-PLAN.md` - What to do if things break

---

## Technical Constraints

- **No new features:** Only bug fixes and data seeding
- **No refactoring:** Don't touch working code
- **No schema changes:** Database is locked
- **Minimum changes:** Reduce risk of breaking things

---

## Testing Approach

### Manual Testing (No Automated Tests Yet)

**Why manual:** 2 days until demo, automated tests take longer to write than manual testing.

**Test flow:**
1. Start sandbox + dev server
2. Open 2 browsers (Chrome + Chrome Incognito)
3. Sign up in both
4. Follow test checklist
5. Document any issues in TEST-RESULTS.md
6. Fix showstoppers, tolerate minor bugs

---

## Demo Day Checklist

**Before leaving house:**
- [ ] Amplify sandbox running locally (backup if WiFi fails)
- [ ] Demo accounts pre-created and tested
- [ ] Demo data seeded
- [ ] Laptop charged (+ charger)
- [ ] Phone as hotspot backup (if WiFi fails)

**At venue:**
- [ ] Connect to WiFi
- [ ] Test app loads
- [ ] Practice script once more
- [ ] Smile and breathe 😊

