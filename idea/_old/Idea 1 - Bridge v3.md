# Bridge v3: Preview. Practice. Go.

**One line:** Bridge walks a neurodivergent young adult through the whole journey of a real community event, before, during and after, with a coach who sets the goals and AI that carries the practice between sessions.

## Why this version
We merged two similar ideas into one:
- **Event Pre-Brief** (know what to expect before you go)
- **Life-Skill Rehearsal Studio** (practice the conversation first)

They solve the same moment, which is getting from "I want to go" to "I went." Separately each is a feature. Together they are a journey.

The Hackautism & COLMAN 2024 yearbook (a promotional showcase of an autism-tech accelerator, not research) added four ideas that sharpen it:

| From the yearbook | What it suggests for Bridge |
|---|---|
| **Tik Tak Studio** (hackathon winner): images that help people prepare for events and reduce anxiety | Add a visual preview of the venue and the event steps, not only text |
| **Parcare**: AI personalizes home activities from a professional's input, because therapy stops when the session ends | A coach sets each person's goals and scenarios, and Bridge carries practice between sessions and events (the "clinic to home" gap becomes "program to real life") |
| **Meyuhadim** and **Step In Out!**: in-person events and facilitated outings (cooking workshops, nature trips) | In-person, structured events are a format that already works. First Place's skill-building events fit it |
| **iAuti** and **RelaxELF**: quick emotion and stress regulation | A one-minute "Reset" card during the event |

Caution: these ventures are mostly child-focused, Israel-based, and described in their own marketing. Use them as format validation and design inspiration, not as proof that they work. The yearbook does not address young adults or executive function directly. We think a young-adult, event-attendance tool is open space, but we have not verified that.

## The problem
After high school, neurodivergent young adults lose most of their supports. Josh Munoz at First Place AZ told us social connection is one of their biggest needs. In his words, without friends "you're not going to want to do anything." Programs run events and teach skills, but the hard part is the moment of going: deciding, planning, starting, arriving and leaving. That chain is executive function.

Research backing (autism-heavy, mostly older data): loneliness is about 0.9 SD higher in autistic people and tracks depression (r = 0.48). Social-skills training raises knowledge much more than real-world behavior (PEERS: knowledge g = 2.15 vs get-togethers about 0.55 to 0.60). The gap is attending.

## The Event Journey

**Before: Preview + Practice**
1. **Preview:** a step-by-step walkthrough of the event: arrival, check-in, where to sit, noise and lighting, who hosts, how long, how to leave. Uses the real venue photos from the event listing. If none exist, we show a clearly labeled illustration, never a fake photo of real people or a real place.
2. **Practice:** scripted, bounded AI role-play for the situations in that event: saying hi, joining a group, asking someone to play, saying no politely. The user sets their own goal ("friendly but short"). After each run: one strength, one tip. Hints fade over time.
3. **My plan:** the user writes their own exit plan and picks one person to text.

**During: Reset**
- A one-minute card: slow-breathing prompt, the exit script the user wrote, and a "text my person" button. No hardware.

**After: Reflect**
- Three taps: how it went, what felt good, what I'd change. Feeds the next preview and practice.

**Coach in the loop (the Parcare idea)**
- First Place staff set each participant's goal (for example, "attend two events this month") and pick scenarios. Staff see aggregate attendance and opt-in "no signal" prompts, never private chat or reflections.
- Early signals come only from Bridge's own data (RSVPs, attendance, skipped reflections) against the person's own baseline. Bridge asks, it does not predict: "We haven't seen you in a while. Want to talk to your coach?"

**Support fades**
- Practice goes from hints, to no hints, to realistic surprises. Success means the user needs Bridge less and attends more.

## What we removed on purpose
- New open social network and stranger matching (cold start, safety)
- Tone grading of messages (risks pushing masking)
- Open-ended AI role-play (untested; scripted scenarios match the one controlled AI trial, Stanford Noora)
- Badges (can feel childish; replaced by user-set goals)

## Who uses it and who pays
- **Young adult:** previews, practices, resets, reflects.
- **Coach/program staff:** sets goals, sees aggregate progress. Likely payer (hypothesis, not tested).
- **Parent or support person:** sees only what the user shares.

## Principled innovation
- User defines what "good" means; no pressure to mask.
- Disclosure-bias test: older models gave avoidant advice after "I'm autistic" (74.4% vs 15.5%). We run the same event scenarios with and without disclosure on our model and show the result.
- Verified members only, report and block visible, 988 one tap away. Not a therapist.
- No medication, ID or Social Security data. Mock data only in the prototype.
- Medical, legal or high-stakes questions get "I'm not sure, ask a person."

## Demo (90 seconds)
1. Coach has set Sam's goal: attend one event this month. Sam gets a "Friday game night" card.
2. **Preview:** he swipes through the venue steps, noise level and exit route.
3. **Practice:** he rehearses inviting Jordan, gets one strength and one tip, and sets his own goal.
4. **Reset:** at the event he opens the one-minute card.
5. **Reflect:** three taps afterward. His progress view updates privately.
6. Coach view shows aggregate attendance and one opt-in "no signal" prompt.

## Why judges should care
- Executive function: the event is a multi-step transition, and we scaffold each step.
- Early indicators: attendance and reflection signals from first-party data.
- Human-centered: built from partner research and a coach in the loop.
- Ethics: masking, consent and disclosure bias are handled and tested.
- Entrepreneurial: a program-level buyer and measurable outcomes (attendance and return).

## One-week plan (Launchpad Fri Nov 6)
- **Oct 30-31:** validate with First Place (questions below); write 3 scenarios and one sample event.
- **Nov 1:** build practice flow with hint fading.
- **Nov 2:** build the preview generator from an event listing.
- **Nov 3:** build Reset, Reflect and the coach view with mock data.
- **Nov 4:** run the disclosure probe; fix issues.
- **Nov 5:** polish; rehearse the 5-minute pitch and 5 slides.

## Validate before pitching
1. What does the First Place events app record, and can we use it?
2. What stops participants from attending or staying? Which situations feel hardest?
3. Would a visual preview feel useful or childish? Who decides the goal?
4. Would coaches use a goals-and-progress view, and what should they never see?
5. How is "80% hired" defined (timeframe, denominator)? What is the autism/ADHD/other mix?
6. Confirm unclear notes: "EIP Pro" and "Oar search and snicker."

## Evidence caveats
Evidence is autism-heavy and mostly 2007 to 2015. No ADHD or dyslexia outcome data, no trial of open-ended AI role-play, and no evidence on predicting overload from passive signals in neurodivergent adults. Pitch Bridge as a testable hypothesis with a pilot plan (attendance and return, hints used, monthly loneliness check, participant and coach feedback).

Source: Hackautism & COLMAN 2024 Yearbook, https://www.seagullinnovation.com/_files/ugd/61e96d_c7ae63a956504d30ac394017b1f303a5.pdf
