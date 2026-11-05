# Bridge Demo Flow - Manual Test Checklist

**Date:** ____________  
**Tester:** ____________  
**Environment:** Local dev / Production

---

## Setup

- [ ] Start Amplify sandbox: `cd app && npx ampx sandbox`
- [ ] Start dev server: `cd app && npm run dev`
- [ ] Open 2 browsers: Chrome + Chrome Incognito
- [ ] Clear browser data (or use fresh profiles)
- [ ] Create a separate test account through the app in each browser

---

## 1. Auth Flow

**Browser 1:**
- [ ] Navigate to http://localhost:5173
- [ ] Click "Create account"
- [ ] Enter a new made-up `example.com` email and a unique test password
- [ ] Account created successfully
- [ ] **Onboarding Step 1 (Welcome):** Shows Mo, "Preview. Practice. Go."
- [ ] Click Continue
- [ ] **Onboarding Step 2 (Interests):** Select 2-3 interests (Gaming, Music, Tech)
- [ ] Click Continue
- [ ] **Onboarding Step 3 (Meet Mo):** Mo intro displayed
- [ ] Click Continue
- [ ] **Onboarding Step 4 (Trusted Person):** Enter name "Mom" + relationship "Parent"
- [ ] Click Continue
- [ ] **Onboarding Step 5 (Comfort):** Pick theme "Dawn", text size "Default", calm mode "Off"
- [ ] Click Finish
- [ ] **Home screen appears** with NavBar
- [ ] Sign out button works
- [ ] **Sign in again** with same credentials
- [ ] Home screen appears immediately (no onboarding)
- [ ] Profile data persists (check Me tab)

**Result:** ✅ Pass / ❌ Fail
**Issues:**

---

## 2. Practice (CRITICAL - THE DEMO STAR)

**Browser 1:**
- [ ] Tap **Practice tab** (6th tab, 🎯 icon)
- [ ] **Scenario picker** shows 7 scenarios
- [ ] Pick **"Join a Chat"** scenario
- [ ] **Setup screen** appears
- [ ] Select **Level 1 (Guided)**
- [ ] Type goal: **"I want to sound friendly"**
- [ ] Goal requires min 5 characters (validation works)
- [ ] Click **Start Practice**
- [ ] **Conversation screen** appears
- [ ] Scenario context message shown
- [ ] Type message: **"Hey everyone! Mind if I join?"**
- [ ] Click **Send** (or press Enter)
- [ ] **Loading state** shows: "Mo is thinking..."
- [ ] Wait 2-10 seconds
- [ ] **AI response appears:**
  - Partner reply makes sense in context
  - Strength is specific and positive
  - Tip is actionable and tied to goal
- [ ] AI feedback is NOT generic/hardcoded
- [ ] Click **"Try Again"**
- [ ] Conversation resets (can type new message)
- [ ] Type new message, get new feedback
- [ ] Click **"Done"**
- [ ] Returns to scenario picker

**Crisis Detection Test:**
- [ ] Pick any scenario
- [ ] Set up practice
- [ ] Type: **"I want to hurt myself"**
- [ ] Click Send
- [ ] **988 alert shows immediately**
- [ ] Alert mentions Crisis Lifeline + 988
- [ ] Returns to scenario picker after alert

**Multiple Scenarios Test:**
- [ ] Test "Left on Read" scenario at Level 2
- [ ] Test "Disagree Kindly" scenario at Level 3
- [ ] Verify AI feedback is different for each

**Result:** ✅ Pass / ❌ Fail
**Issues:**

---

## 3. Circles (Real-Time Chat)

**Browser 1:**
- [ ] Tap **Circles tab**
- [ ] See 6 circles (Gaming, Music, Anime, Cooking, Art, Tech)
- [ ] Tap **Gaming circle**
- [ ] Daily topic displays at top
- [ ] The circle starts empty unless a real user has posted
- [ ] Type message: **"What's everyone playing?"**
- [ ] Click **Send**
- [ ] Message appears in chat immediately

**Browser 2:**
- [ ] Sign in with the second account created during setup
- [ ] Tap **Circles tab**
- [ ] Tap **Gaming circle**
- [ ] **Verify:** Browser 1's message "What's everyone playing?" is visible
- [ ] Type reply: **"Minecraft!"**
- [ ] Click Send

**Back to Browser 1:**
- [ ] **Verify:** Browser 2's reply "Minecraft!" appears in real-time (no refresh needed)
- [ ] Subscription is working (push-based updates)

**Result:** ✅ Pass / ❌ Fail  
**Issues:**

---

## 4. Events & RSVP

**Browser 1:**
- [ ] Tap **Events tab**
- [ ] Create an event through the app
- [ ] Event cards show: date tile, title, location, RSVP buttons
- [ ] Tap **"Going"** on the event
- [ ] Button highlights (active state)
- [ ] Going count updates (X+1)
- [ ] **Refresh page** (Cmd+R / Ctrl+R)
- [ ] Navigate to Events tab again
- [ ] **Verify:** "Going" button still highlighted (persistence)
- [ ] Tap **"Maybe"** on same event
- [ ] State updates to "Maybe"
- [ ] Counts update correctly

**Result:** ✅ Pass / ❌ Fail  
**Issues:**

---

## 5. DMs (Message Requests)

**Browser 1:**
- [ ] Tap **DMs tab**
- [ ] See contacts list or empty state
- [ ] (If empty, contacts must be added via accept flow - test if time permits)

**Optional DM Flow (if 2 accounts available):**
- [ ] Browser 2: Send DM request to Browser 1
- [ ] Browser 1: See request badge/notification
- [ ] Browser 1: Accept request
- [ ] Browser 1: See contact in list
- [ ] Browser 1: Tap contact, open thread
- [ ] Browser 1: Send message
- [ ] Browser 2: Verify message appears in thread

**Result:** ✅ Pass / ❌ Fail / ⏭️ Skipped  
**Issues:**

---

## 6. Me Profile

**Browser 1:**
- [ ] Tap **Me tab**
- [ ] Profile displays: name, email, interests
- [ ] Current theme shown
- [ ] Current theme matches the choice saved during onboarding
- [ ] **Refresh page**
- [ ] Navigate to Me tab
- [ ] **Verify:** the same theme remains displayed after refresh

**Result:** ✅ Pass / ❌ Fail  
**Issues:**

---

## 7. Home Screen

**Browser 1:**
- [ ] Tap **Home tab**
- [ ] Welcome message with user's first name
- [ ] Event list displays (or empty state)
- [ ] Mo buddy shows with encouragement
- [ ] Loading state shown during event fetch
- [ ] No errors on load

**Result:** ✅ Pass / ❌ Fail  
**Issues:**

---

## 8. Navigation

- [ ] Tap each of 6 tabs: Home, Circles, Events, Practice, DMs, Me
- [ ] Active tab highlights correctly
- [ ] Each screen loads without errors
- [ ] Back button works in Practice (setup → picker)
- [ ] NavBar always visible at bottom

**Result:** ✅ Pass / ❌ Fail  
**Issues:**

---

## 9. Console Errors Check

**Browser 1:**
- [ ] Open DevTools (F12 or Cmd+Option+I)
- [ ] Go to **Console** tab
- [ ] Clear console
- [ ] Navigate through all 6 tabs
- [ ] Send a Practice message
- [ ] Send a Circles message
- [ ] RSVP to an event
- [ ] **Check console:**
  - [ ] No RED errors during demo flow
  - [ ] Yellow warnings OK (tolerable)
  - [ ] Network errors NOT OK (API failures)

**Console Output:**
```
(Paste any red errors here)
```

**Result:** ✅ Pass / ❌ Fail  
**Issues:**

---

## 10. Mobile Responsive

**Phone or Narrow Browser:**
- [ ] Resize browser to 375px width (iPhone size)
- [ ] All screens readable and functional
- [ ] Buttons 44px+ (tappable)
- [ ] No horizontal scroll
- [ ] NavBar fits on screen
- [ ] Practice conversation UI works

**Result:** ✅ Pass / ❌ Fail
**Issues:**

---

## 11. Backup Evidence

- [ ] Capture a screenshot of Practice feedback (partner reply, strength, and tip)
- [ ] Capture a screenshot of the 988 crisis response without including account details
- [ ] Capture a screenshot of two-browser real-time circle chat
- [ ] Save screenshots outside the repository if they contain account identifiers

**Result:** ✅ Pass / ❌ Fail
**Issues:**

---

## Summary

**Total Tests:** _____ / 11
**Pass:** _____  
**Fail:** _____  
**Skipped:** _____

### Showstopper Bugs (Must Fix Before Demo)
1. 
2. 
3. 

### Minor Bugs (Tolerable for Demo)
1. 
2. 
3. 

### Things That Work Great
1. 
2. 
3. 

### Demo Readiness
- [ ] All critical flows work
- [ ] No showstopper bugs
- [ ] Console has no red errors
- [ ] Ready to demo on Nov 6

**Overall:** ✅ Ready / ⚠️ Needs Fixes / ❌ Not Ready

