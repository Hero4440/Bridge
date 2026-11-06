# Bridge: Master Brief

**Team:** Ctrl Alt Elite | **Challenge:** North American AI Challenge for Neurodiverse Learning | **Prepared:** Mon Nov 2, 2026
**Decision:** The team is going with **Bridge** ("Preview. Practice. Go.")
**Next deadline:** Scottsdale Regional Launchpad, **Fri Nov 6, 4:00-8:00 p.m.**, hosted by ASU. In-person pitch and demo, 5 minutes or less, 5-slide template.

---

## 1. Snapshot

**One line:** Bridge walks a neurodivergent young adult through the whole journey of a real community event (before, during, after), with a coach who sets the goals and AI that carries the practice between sessions.

**The core insight:** The gap is not knowing what to say. It is *showing up*. Research shows social-skills training raises knowledge far more than real-world behavior. Attending an event is a chain of executive-function steps (decide, plan, start, travel, arrive, stay, leave, reflect), and that chain is where people stall. Bridge supports each step.

**The loop:** Preview -> Practice -> Go (with a Reset card) -> Reflect -> Repeat, with support that fades over time.

**Headline metric to show:** attendance and return, not in-app scores. Fewer hints needed over time is the second metric.


## 2. Primary research: partner visits (n = 2 visits, our own notes)

**First Place AZ (adult-living community program), visited Oct 27:**
- About 80% of participants get hired, which they credit to the community. *Unverified: ask how "hired" is defined (timeframe, denominator).*
- ADHD participants may not live with their parents. Community perspective is their approach. Benefits show up when people connect.
- Not just autism.
- Participants pay for rent and then separately for therapy.
- Skills taught: cooking, money management, friends, dating, jobs.
- Events are hosted on an app and are always skill-building.
- Josh Munoz said social connection is one of their biggest needs. In his words, without friends "you're not going to want to do anything." People stop taking care of their health, and work feels pointless because "you're spending it by yourself." Starting conversations and meeting new people is hard, so many end up isolated, relying on parents or staff.
- Josh asked that the solution work for people who live at First Place, who have moved out, and who never lived there.
- Leads from the visit: UCLA Semel Institute, UCLA PEERS (social skills), role-play videos. "Oar search and snicker" is unclear in the notes (confirm with Tejas).

**Arizona school, visited Oct 29:**
- "EIP Pro" (unclear in notes, confirm)
- Easy to transfer paperwork (this *weakens* a records-handoff product idea)
- K4 to K12
- 3-to-1 student-to-teacher ratio
- 400 to 500 students
- Mostly outside our 16-30 target age band.

---

## 3. Evidence base (from the research report)

Full report: `Neurodivergent young adult unmet needs.md`. Evidence is **autism-heavy and mostly 2007-2015**. No ADHD or dyslexia outcome data, no trial of open-ended AI role-play, and no evidence on predicting overload from passive signals in neurodivergent adults. Pitch Bridge as a **testable hypothesis**.

**Verified findings we can use:**
- **Loneliness:** autistic people are lonelier than non-autistic people (Hedges' g = 0.89, 23 studies). Loneliness correlates with depression (r = 0.48). Young people with ADHD under 25 are also lonelier than peers (20 studies; effect size not retrieved).
- **Services cliff:** unmet service needs jumped at school exit (p = .009, 14-year study of 204 autistic people). 37% of autistic young adults were disconnected from both work and school (Drexel 2015).
- **Training gap:** PEERS meta-analysis (9 controlled studies, n = 441): knowledge g = 2.15, but parent-reported function about 0.71 to 0.72 and real get-togethers about 0.55 to 0.60. Real-world carryover is the weak point.
- **Employment:** 33.6% currently employed in a national autism sample; 29.5% of 315 autistic adults aged 18 to 35 reported being fired and mostly blamed themselves.
- **AI evidence:** Stanford's Noora (30 autistic people, ages 11-35, waitlist-controlled) used scripted scenarios, and empathetic statements in live conversation rose from about 17% to 51%. No effect size reported; no active comparator.
- **AI risks (HCI studies):** automated masking, sycophancy, over-reliance, and avoidant advice after disclosure. One audit found one older model advised declining a social invitation 74.4% of the time after autism disclosure versus 15.5% without. Those models are older, so test ours.
- **ADHD barriers (self-selected ADDitude survey, n = 4,170):** rejection sensitivity (65%), working memory (63%), masking (59%), executive dysfunction (57%). Some people cancel plans even when invited.

**Figures NOT to quote:** "60-90% of autistic adults unemployed," "1 in 3 ADHD unemployed," "four times more likely lonely." Quote others only with their caveats.

**Hackautism & COLMAN 2024 yearbook** (promotional, child-focused, Israel-based; format inspiration only, not proof): Tik Tak Studio (hackathon winner; images that help people prepare for events), Parcare (AI personalizes home activities from a professional's input), Meyuhadim (social events), Step In Out! (facilitated outings), iAuti and RelaxELF (emotion regulation).

---

## 4. How Bridge evolved

**v1 (original pitch):** Connect (interest circles, matching) + Practice (AI role-play) + Meet (group chat -> 1:1 -> group event) + AI buddy (reply suggestions, tone check, safety flags) + Check-in + fading support.

**Problems found with v1:**
1. Reads as a social app, not an executive-function tool.
2. Cold start: a new network has no users to demo.
3. Stranger matching raises safety concerns.
4. Tone-checking risks pushing masking.
5. Open-ended AI role-play and reply suggestions are untested.
6. Too much scope for one week.
7. No stated payer.

**v2:** Reframed around showing up and executive-function transitions; layered onto First Place's existing events; added the Event Pre-Brief, Reflect, a staff view and a disclosure-bias test; made role-play scripted.

**v3 (current, "Preview. Practice. Go."):** Merged **Event Pre-Brief** and **Life-Skill Rehearsal Studio** into one journey. Added a visual preview, a one-minute Reset card during the event, and a coach-in-the-loop setting goals.

**Removed on purpose:**
- New open social network and stranger matching
- Tone grading of messages
- Open-ended AI role-play
- Progress badges (replaced by user-set goals)
- Always-on AI buddy reply suggestions (an optional "Help me say it" in the user's own words is a possible stretch)

**Other ideas considered and why they lost:** Ambiguity Decoder (free chatbots do it; thin evidence), Transition Passport (school said paperwork is easy), Sensory/overload forecast (needs sensing hardware; no adult evidence), Teacher social stories (outside age band), Drift Detector (kept only as a thin signal inside Bridge), Job Keeper and Coach Copilot (strong alternative direction, not chosen), Body-Double Rooms (too close to a standalone productivity app), Trial Week simulator (thin skill evidence), **Second Chance** (friendship-repair messages after canceling or ghosting; the best optional add-on to Bridge's "After" step if time allows).

---

## 5. Product spec

### Users
- **Young adult (primary):** previews, practices, resets, reflects.
- **Coach / program staff (e.g., First Place):** sets goals and scenarios, sees aggregate engagement only.
- **Support person (parent, friend):** sees only what the user chooses to share.

### The journey

**BEFORE: Preview + Practice**
1. **Event card:** a coach-posted or listing-based event (e.g., "Friday game night").
2. **Preview:** step-by-step walkthrough: what happens, how long, how many people, who hosts, noise and lighting, where to arrive and sit, what to wear, how to leave. Uses real venue photos from the listing; if none, a clearly labeled illustration (never a fake photo of a real place or real people).
3. **Practice:** scripted, bounded AI role-play for the conversations in that event. The user sets their own goal first ("friendly but short"). After each run: **one strength, one tip**, judged against *their* goal, not a neurotypical standard.
4. **My plan:** the user writes their own exit plan and picks one person to text.

**DURING: Reset**
- A one-minute card: slow-breathing prompt, the exit script they wrote, and a "text my person" button. No hardware.

**AFTER: Reflect**
- Three taps: how it went, what felt good, what I'd change. Feeds the next preview and practice.
- If two people **both** choose to share contact details, they can connect inside the app.

**COACH VIEW**
- Coach sets each person's goal (e.g., "attend two events this month") and picks scenarios.
- Coach sees **aggregate attendance only**, never private messages or reflections.
- If someone has been quiet for a while, **Bridge checks in with them first** and offers to connect them with a coach or friend they choose. Coach alerts only if the user opted in.

**SUPPORT FADES**
- Practice level 1: hints and sentence starters shown.
- Level 2: no hints, one "I'm stuck" button.
- Level 3: realistic surprises (someone asks an unexpected question, the group is mid-conversation, it gets loud).
- Success = the user needs Bridge *less* and attends *more*.

### Sample content (ready to use in the prototype)

**Scenario 1: Join a group at game night.** AI plays Jordan, a friendly player mid-game.
- L1: starter chips ("Hey, mind if I watch a round?")
- L2: no chips; "I'm stuck" gives one nudge
- L3: Jordan asks "wait, have we met?" while the room gets loud
- Feedback example: "Strength: you asked a question about the game. Tip: add your name when you say hi, since you wanted to be friendly but brief."

**Scenario 2: Invite someone to an event.** AI plays Jordan, who is not sure.
- Practice hearing a maybe, and ending warmly either way.

**Scenario 3: Say no or leave politely.** AI plays a person asking you to stay longer.
- Practice using the user's own exit line.

**Optional Scenario 4 (work):** Ask a manager a clarifying question about a vague instruction (a cheap nod to the Ambiguity Decoder idea).

**Pre-brief fields:** event name, time and duration, host, expected group size, activities, noise and light level, quiet space available, what to wear, arrival steps, how to leave, two or three openers tied to the user's listed interests.

**Reflection:** (1) How did it go? (2) What felt good? (3) What would I change? Plus an optional "Who did I enjoy talking to?" that can trigger the mutual contact-share option.

**Signal rule (simple, explainable):** baseline = the user's own typical gap between interactions. If the gap is more than twice their baseline *and* at least 7 days, Bridge sends a gentle message to the user. No guessing why. Missing data is a prompt to ask, not a prediction.

### AI guardrails (system-prompt rules)
- Stay in role. Plain, friendly, short language.
- Judge only against the user's chosen goal; never "sound more neurotypical."
- No medical, legal or financial advice. For high-stakes questions say "I'm not sure, ask a person."
- Never ask for or store ID, medication, financial or Social Security data.
- **Parity rule:** advice must not change when the user mentions a diagnosis.
- If the user expresses crisis, stop the role-play and show 988 and a trusted-person prompt.
- No romantic, sexual or abusive role-play. Never imitate real people.
- Safety flag in any chat feature: requests for money or addresses.

---

## 6. Principled innovation (ethics slide)
- User defines what "good" means; no pressure to mask.
- Scripted, bounded scenarios, like the one controlled AI trial (Noora).
- Verified members only; report and block always visible.
- Not a therapist; 988 one tap away.
- No medication, ID or financial data. User controls what the support circle sees.
- Coach sees aggregate only; check-ins go to the user first.
- Mock data only in the prototype; no real resident information or photos.
- **Disclosure-bias test** (our differentiator): run the same 10 event scenarios on our chosen model with and without "I'm autistic" or "I have ADHD" added. Count how often the advice becomes "skip it" or avoidant. Show the parity result on a slide. Run it *before* Nov 5 so any fixes land in the prompt.


## 7. Business model (hypothesis, not tested)
- Likely payer: programs and service providers (participants already pay rent and therapy separately, which argues against an individual paywall).
- Value to buyer: attendance and engagement visibility, staff time saved, earlier outreach.
- Public funding (Medicaid waivers) is a slow channel (long waitlists).
- Research has no willingness-to-pay data, so say "hypothesis" and name the validation step.

## 8. Validation, pilot plan and partner outreach

**Email sent to partners:** asks (1) what the First Place events app records and for sample screens or a data outline with no personal information, (2) what most often stops participants from attending or staying, and (3) feedback on the plan. Offers a 15-minute call this weekend or early next week. **Check for replies and use any answer in the pitch with attribution.**

**Still unanswered:** First Place's definition of "80% hired"; what "EIP Pro" and "Oar search and snicker" are; whether the preview feels helpful or childish; what coaches should never see; who pays.

**Pilot plan to show (planned, not run):** First Place trial with a small group over four weeks. Measure event attendance and return rate, hints used per rehearsal (trending down), a short monthly loneliness check, and participant and coach feedback on whether Bridge feels useful or childish.

---

## 9. Open questions and risks
- Evidence is mostly autism, mostly older data. Say so.
- Disclosure bias on *our* model is untested until we run the probe.
- Competitor table unverified. Visual previews need real venue photos or labeled illustrations.
- Payer and willingness-to-pay are hypotheses.
- Four days left to build. Protect the must-haves and rehearse the pitch.
- Check the Presenter Packet for slide template, time rules and demo requirements.
- Confirm travel and arrival time for Scottsdale (4-8 p.m. window).

---

## 10. Files and sources

**Project docs:** Bridge v3 - Preview Practice Go; Bridge v2 - Enhanced Pitch; Idea 1 - Bridge (brainstorm); Partner Visit Notes (Oct 27-29); organizer docs (Intro, More info, Launching This Saturday).
**On your computer:** `/Users/hero4440/Documents/Code/neuro/idea/` (Idea 1 - Bridge.md, Idea 1 - Bridge v3.md, and this brief).
**Research report:** Neurodivergent young adult unmet needs.md (cites Hymas et al., Laxman et al. 2019, Zheng et al. 2021, Drexel Autism Institute, Roux et al. 2013, Pezzimenti et al. 2024, Stanford Noora, Jang et al. CHI 2024, ADDitude survey, and others).
**Yearbook:** Hackautism & COLMAN 2024, https://www.seagullinnovation.com/_files/ugd/61e96d_c7ae63a956504d30ac394017b1f303a5.pdf
