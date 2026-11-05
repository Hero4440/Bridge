# Bridge Demo Script - Nov 6, 2026

**Team:** Ctrl Alt Elite  
**Time:** 4 minutes
**Venue:** Scottsdale Launchpad  
**Judges:** ASU Spark Center + First Place AZ

---

## Setup Before Demo

- [ ] Laptop charged + charger available
- [ ] Demo account pre-created and tested (or can sign up live)
- [ ] Amplify sandbox running (`cd app && npx ampx sandbox`)
- [ ] Dev server running (`cd app && npm run dev`)
- [ ] Demo data seeded from `app/` (`npm run seed:demo`)
- [ ] Browser open to http://localhost:5173
- [ ] Second browser/tab ready for real-time demo (optional)
- [ ] Backup slides ready (if app crashes)

---

## Script (4 Minutes)

### [0:00 - 0:25] Opening & Problem

**Say:**

> "Hi, I'm [Your Name] from Team Ctrl Alt Elite. This is Bridge."
>
> **[Show app on screen]**
>
> "Bridge is a social-emotional practice app for autistic young adults, built in partnership with First Place AZ for the North American AI Challenge."
>
> "We discovered that the gap isn't *knowing* what to say in conversations - it's showing up in the first place. Anxiety about joining conversations or attending events stops people from participating."
>
> "Bridge helps users Preview what to expect, Practice with AI feedback, and then Go to the real thing."

**Timing: 25 seconds**

---

### [0:25 - 0:45] Onboarding (Fast Overview)

**Option A (Sign up live):**
> "Let me create an account real quick..."
> 
> **[Sign up, fast-forward through onboarding]**
> 
> "Five quick steps: pick interests, meet Mo our AI buddy, set a trusted person, and comfort preferences like themes and text size."

**Option B (Use pre-created account):**
> "I'll sign in with a demo account so we can jump right to the features..."
> 
> **[Sign in, shows Home screen]**
> 
> "Users go through onboarding once - pick interests, meet Mo, set comfort preferences. Very quick."

**Timing: 20 seconds total (0:45 elapsed)**

---

### [0:45 - 2:45] Practice Feature (THE STAR - 2 MINUTES)

**Say:**

> "The core feature - and THE differentiator - is Practice."
>
> **[Tap Practice tab]**
>
> "Users practice conversations with real AI feedback BEFORE facing real situations."
>
> **[Show 7 scenarios]**
>
> "Seven real-world scenarios: joining a chat, handling a friend who cancels plans, disagreeing kindly, and more."
>
> **[Tap "Join a Chat"]**
>
> "Let's practice joining an ongoing conversation."
>
> **[Show level selector]**
>
> "Three difficulty levels with fading support. Level 1 gives gentle hints and encouragement. Level 3 adds realistic surprises. Support fades as confidence builds."
>
> **[Select Level 1, type goal: "I want to sound friendly"]**
>
> "Critically - the user sets their OWN goal. Mo judges their practice against *their* goal, not some neurotypical standard. This is parity by design."
>
> **[Click Start Practice]**
>
> **[Show conversation screen]**
>
> "Mo plays the other person in the conversation. Let's try..."
>
> **[Type: "Hey everyone! Mind if I join?"]**
>
> **[Click Send]**
>
> **[WAIT - show "Mo is thinking..."]**
>
> "This is real Bedrock Claude analyzing the response in real-time - not hardcoded. Takes a few seconds..."
>
> **[AI response appears]**
>
> "And here's the feedback!"
>
> **[Point to screen, read aloud]:**
>
> - "Mo's reply: [read partnerReply]"
> - "Strength: [read strength] - Notice how specific this is?"
> - "Tip: [read tip] - Actionable, tied to their goal"
>
> "This personalization is the magic. Every practice is different. Seven scenarios, three levels, all with tailored feedback."
>
> **[If time allows, click "Try Again" and show you can practice multiple times]**

**Timing: 2 minutes (2:45 elapsed)**

---

### [2:45 - 3:25] Social Features

**Say:**

> "After practicing, users try it for real."
>
> **[Navigate to Circles tab]**
>
> "Circles are interest-based groups - Gaming, Music, Anime, Cooking, Art, Tech. Live chat with daily conversation starters."
>
> **[Tap a circle, show messages]**
>
> "Real-time subscriptions via AppSync - connected users see new messages without refreshing."
>
> **[Navigate to Events tab]**
>
> "Events help users preview what to expect - who's coming, sound level, lighting, exit plan. They can RSVP with comfort settings."
>
> **[If time, show an event card]**
>
> **[Navigate to DMs tab]**
>
> "Direct messages with safety - first message from a non-contact goes through Mo's safety check first."

**Timing: 40 seconds (3:25 elapsed)**

---

### [3:25 - 3:40] Safety

**Say:**

> "Safety was built in from day one. If someone expresses self-harm in practice or chat, they immediately see 988 - the Suicide and Crisis Lifeline."
>
> **[Optional: Show crisis detection if time]**
>
> "We don't store raw practice transcripts. Privacy-first, safety-first."

**Timing: 15 seconds (3:40 elapsed)**

---

### [3:40 - 4:00] Impact & Closing

**Say:**

> "Why this matters: Research shows practice has strong effect sizes - people learn conversation skills. But getting to real events requires the support systems Bridge provides."
>
> "Preview. Practice. Go. Building confidence at their own pace."
>
> **[If judges look engaged]:** "Happy to answer questions!"
>
> **[If time is up]:** "Thank you!"

**Timing: 20 seconds (4:00 total)**

---

## Backup Plans

### If Bedrock is Slow (>10 seconds)
> "Sometimes the first Bedrock call takes a bit longer - let me show you the social features while that loads..."
>
> **[Navigate to Circles or Events]**
>
> **[Come back to Practice if it loaded]**

### If Bedrock Fails (Error)
> "Looks like we hit a rate limit - our fallback response kicks in so users never hit a dead end. Let me show you another scenario..."
>
> **[Try different scenario, OR move to social features]**

### If App Crashes
> "Technical difficulties! Let me show you the architecture instead..."
>
> **[Pull up backup slides: architecture diagram, tech stack, screenshots of working app]**

### If Internet Fails
> "WiFi down - good thing I tested locally! Here are screenshots of the working app..."
>
> **[Show screenshots/slides]**

---

## Key Talking Points (Don't Forget!)

✅ **Practice is THE differentiator** - real AI, personalized feedback  
✅ **Parity by design** - judge against user's goal, not neurotypical standard  
✅ **Fading support** - Level 1 → 2 → 3 as confidence builds  
✅ **Safety-first** - Crisis detection, 988, no raw transcripts  
✅ **Real tech** - Real Bedrock Claude, real Cognito/DynamoDB/Amplify, real AppSync subscriptions  
✅ **Partnership** - Built WITH First Place AZ, for their community

---

## Things to Avoid

❌ Don't say "mock" or "hardcoded" - emphasize real AI  
❌ Don't say "AI will replace therapists" - Mo is NOT a therapist  
❌ Don't promise features not built (Notifications UI, Tone Check UI)  
❌ Don't say "we ran out of time" - say "focused on core value"  
❌ Don't apologize for loading delays - "Bedrock takes a few seconds" is normal

---

## Post-Demo Q&A Prep

**Expected Questions:**

**Q: How do you ensure AI feedback is appropriate?**  
A: "Every prompt includes guardrails - judge only against the user's goal, parity rules, crisis detection, and no medical or legal advice. Before production, we will also run the planned parity and bias probes."

**Q: What about users without smartphones?**  
A: "It's a responsive web app designed for modern phone and laptop browsers. The Phase 7 checklist verifies both widths before the demo."

**Q: How do you measure success?**  
A: "Prototype testing with First Place residents - do they feel more confident? Do they attend more events? Long-term: track attendance rates, self-reported confidence."

**Q: What about privacy?**  
A: "We don't store raw practice transcripts - only the scenario, level, and feedback. Chat messages persist so conversations work, and access is Cognito-authenticated."

**Q: What's next?**  
A: "Deploy to production with First Place, pilot with 10-15 residents, iterate based on feedback, expand to other First Place locations."

---

## Demo Day Checklist

**Morning of:**
- [ ] Test app works end-to-end
- [ ] Charge laptop fully
- [ ] Pack charger
- [ ] Bring backup slides (PDF on laptop + phone)
- [ ] Bring phone as hotspot backup
- [ ] Practice script 1-2 more times
- [ ] Eat breakfast, stay hydrated

**At venue (1 hour before):**
- [ ] Connect to WiFi
- [ ] Test app loads
- [ ] Run through demo once quietly
- [ ] Breathe, smile, you got this! 😊

**During demo:**
- [ ] Speak clearly and not too fast
- [ ] Make eye contact with judges
- [ ] Smile (you're excited about this!)
- [ ] If something breaks, stay calm and pivot to backup

**After demo:**
- [ ] Thank judges
- [ ] Answer questions confidently
- [ ] Network with other teams
- [ ] Celebrate - you built something amazing! 🎉

