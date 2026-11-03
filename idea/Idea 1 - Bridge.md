# Bridge v2: Rehearse It Here. Show Up Out There.

Bridge helps neurodivergent young adults turn "I want friends" into "I went, and it went okay." It combines AI rehearsal, a pre-brief for real community events, and a gentle check-in. Support fades as the person gains confidence and real friends take its place.

## The problem
After high school, neurodivergent young adults lose most of their supports. Josh Munoz at First Place AZ told us social connection is one of their biggest needs. In his words, without friends "you're not going to want to do anything." People stop taking care of their health, and work feels pointless because "you're spending it by yourself."

The research points the same way, with caveats (most data is from autistic samples, often older):
- Autistic people score about 0.9 standard deviations lonelier than non-autistic people, and loneliness tracks depression (r = 0.48). Young people with ADHD are also lonelier than peers.
- Unmet service needs jumped at school exit in a 14-year study of 204 autistic people.
- Social-skills training raises what people know much more than what they do. In the PEERS meta-analysis, knowledge scored g = 2.15, but real get-togethers only about 0.55 to 0.60.

**The gap is showing up, not knowing what to say.** Bridge is built for that moment.

## Why this is an executive-function product
Going to one event is a chain of executive-function steps: decide, plan, start, travel, arrive, stay, leave, reflect. Many people stall at the start or the arrival. Bridge supports each step instead of only teaching "social skills."

## The loop

**1. Rehearse (Practice Studio)**
- Scripted, bounded AI role-play: saying hi in a group, keeping a conversation going, inviting someone, saying no politely, calling a landlord, asking a manager a clarifying question.
- The user picks their own goal for each scenario ("I want to be friendly but brief"). Bridge does not grade them against a neurotypical standard.
- After each run: one strength, one tip.

**2. Pre-Brief (before a real event)**
- Built from the event listing: what happens, who is hosting, how many people, the sensory setup (noise, lights, crowding), what to wear, how to arrive, how to leave, and two or three openers tied to the user's interests.
- Includes an exit plan the user writes themselves and a "text someone I trust" button.

**3. Attend**
- Events come from First Place's existing events program (closed, verified circles) rather than a new open network.
- Interest circles (Gaming, Anime, Music, Cooking, Sports, Art, Tech) keep the daily topic prompt so nobody has to invent what to say.

**4. Reflect (after the event)**
- Three taps: how did it go, what felt good, what I'd change. Feeds the next rehearsal.

**5. Check-in and early signals**
- Short wellbeing questions from Josh's suggestions: When did you last eat? When did you last see a friend? Who could you call right now?
- Early signals come only from Bridge's own data (RSVPs, attendance, skipped check-ins), measured against the person's own baseline.
- The system asks, it does not predict: "We haven't heard from you in a week. Want to talk to Jordan or your coach?"
- Never a therapist. 988 is always one tap away.

**6. Support fades**
- Rehearsal moves from hints, to no hints, to realistic surprises.
- The headline measure is how much the person needs Bridge less: fewer hints, more real events, more contact with real people.

## What changed from v1, and why

| v1 | v2 | Reason |
|---|---|---|
| New social network with matching | Layer on First Place's existing community | Cold start, stranger safety |
| AI buddy suggests replies and checks tone | Optional "Help me say it" in the user's own words; no tone grading. Safety flags stay (money, addresses) | Research flags masking and over-reliance as the main risks |
| Progress badges | User-set goals and a private progress view | Badges can feel childish and push a standard the user didn't choose |
| Open-ended AI role-play | Scripted, bounded scenarios | The only controlled AI trial (Stanford Noora) used scripted scenarios; open-ended is untested |
| Support circle sees "what the user shares" | Same, plus an opt-in staff view with aggregate engagement only | Gives programs a reason to pay without exposing individuals |
| Competitor claim: "the only one" | Careful wording, verify table before pitching | Not independently verified |

## Who uses it and who pays
- **Young adult:** rehearses, gets pre-briefed, attends, reflects.
- **Support circle (parent, coach):** sees only what the user chooses to share.
- **Program staff (First Place):** sees aggregate attendance and "no signal" prompts the user opted into.
- **Likely payer (hypothesis, not yet tested):** programs and service providers, since participants already pay rent and therapy separately.

## Fit with First Place AZ
- Targets the social connection need Josh named.
- Runs on top of their events, which are already skill-building and hosted on an app.
- Works for residents, people who have moved out, and people who never lived there.

## How Bridge is different (verify before pitching)
Existing tools tend to do one piece: friendship matching (for example Hiki), AI conversation practice (for example Skill Coach), or interest-based meetups (Meetup, Discord, Bumble BFF). Bridge's difference is closing the loop between practice and real-world attendance, measuring attendance and return, and fading its own support. We have not independently verified each app's features, so check them and soften "only one" to "one of the few" unless confirmed.

## Principled innovation
- Verified members only; report and block always visible.
- AI flags requests for money or personal information.
- No medication, ID or Social Security data. The user controls what their support circle sees.
- The user defines what a good outcome looks like; no pressure to mask.
- Bounded scripted scenarios; for medical, legal or high-stakes questions the AI says it is unsure and points to a person.
- We test our model for disclosure bias. One audit found that telling older models "I'm autistic" made them advise skipping a social event 74.4% of the time versus 15.5% without. We run the same event scenarios with and without disclosure on our chosen model and show the result.
- Not a therapist; 988 always one tap away.
- Mock data only in the prototype, with no real resident information or photos.

## How we will know it works (pilot plan, not yet run)
- Event attendance and return rate
- Hints used per rehearsal, trending down
- Self-reported loneliness, monthly, short
- Participant and staff feedback on whether it feels useful or childish

## Demo (90 seconds)
1. Sam's check-in shows he hasn't seen anyone in a week and suggests the Gaming circle.
2. Sam sees Friday's game night with a pre-brief: noise level, who is hosting, how to leave.
3. He rehearses inviting Jordan with AI role-play and gets one strength and one tip.
4. He sets his own goal ("stay 30 minutes") and RSVPs.
5. After the event he reflects in three taps. His private progress view updates, and his support circle sees only what he shared.
6. Staff view shows aggregate attendance and one opt-in "no signal" prompt.

## One-week plan (today is Fri Oct 30, Launchpad Fri Nov 6)
- **Oct 30-31:** Validate with First Place and participants (questions below). Write 3 scenarios.
- **Nov 1:** Build the rehearsal flow with hint fading.
- **Nov 2:** Build the pre-brief generator from a sample event listing.
- **Nov 3:** Build reflect and check-in, plus the simple staff view with mock data.
- **Nov 4:** Run the disclosure probe on our model. Fix issues.
- **Nov 5:** Polish and rehearse the 5-minute pitch and 5 slides.
- **Nov 6:** Present.

## Validate with partners before the pitch
1. What does the First Place events app record (RSVPs, attendance, check-ins), and can we use it?
2. What stops participants from attending or staying at events? Which two or three situations feel highest stakes?
3. Does a pre-brief feel useful or infantilizing? Who defines success?
4. Who pays, and who should see the "no signal" prompt?
5. How is "80% hired" defined (timeframe, denominator)? What is the autism/ADHD/other mix?
6. Confirm unclear notes: "EIP Pro" and "Oar search and snicker."

## Evidence caveats
Evidence is autism-heavy and mostly 2007 to 2015. There is no ADHD or dyslexia outcome data, no trial of open-ended AI role-play, and no evidence on predicting overload from passive signals in neurodivergent adults. Pitch Bridge as a testable hypothesis with a clear validation plan.
