AI Prompts Log - Rishi Kataria
Team: Ctrl Alt Elite
 Project: Bridge - North American AI Challenge for Neurodiverse Learning
 Partner: First Place AZ
 Tool: Claude Sonnet 4.6 (claude.ai)
 Date Range: Oct 27- Nov 5, 2026

How I Used AI
I used Claude as a design and engineering collaborator throughout the Bridge prototype build - not to generate finished work, but to iterate on UI decisions, generate Figma Make prompts I then reviewed and applied, and debug rendering issues I found by testing. Every prompt below was reviewed before applying; outputs that conflicted with teammate constraints or felt off were revised or rejected.

Entry 1
Date: Oct 27, 2026
 Who: Rishi Kataria
 Tool: Claude Sonnet 4.6
 Purpose: Fix 4 UI bugs found after first build - scroll state bleeding between screens, left-border card stripes, CTA button overlapping nav, and circle cards looking bad.
Prompt:
"Scrolling should be managed screen to screen. From step 2 to step 3 when I went, on step 2 I had scrolled down but when I went to step 3 I saw the screen which was already scrolled down."
"I don't want those side lines on each card, it totally shows that it has been designed by Claude."
"See how the CTA button is placed over bottom nav."
"Also, the cards in circle is looking so odd. I gave you screenshots for UI inspiration then why can't you build a good UI app, this UI looks so dull."
What I used / changed: Applied scroll reset fix (window.scrollTo on every go() call). Removed all borderLeft styles from cards - replaced with box-shadow only. CTA fixed positioning spec applied. Reviewed the circle card redesign and confirmed it matched the inspiration screenshots before applying.

Entry 2
Date: Oct 28, 2026
 Who: Rishi Kataria
 Tool: Claude Sonnet 4.6
 Purpose: Understand Calm Mode and decide whether to build it as a real functional feature or just a toggle. Research color preferences for neurodivergent users.
Prompt:
"What is use of Calm mode (On and off)? Also, for UI we are having four options, is it necessary to change the color of background of each page? It looks very dull, is it related to special people? What are their choices on colors and UI? What color apps do they like using, UX and color specific wise?"
What I used / changed: Used the research on ADHD/autism color preferences to confirm we should NOT do 4 background colors. Agreed with Claude's recommendation: keep #F8F7F4 neutral everywhere, add color moments in icon blocks and Mo moods. Used the Calm Mode functional spec (kills animations, reduces font sizes, hides live indicators) - this became a real feature not just a toggle. Rejected the suggestion of 4 background themes entirely.

Entry 3
Date: Oct 28, 2026
 Who: Rishi Kataria
 Tool: Claude Sonnet 4.6
 Purpose: Get Figma Make prompts for Calm Mode implementation and color system.
Prompt:
"I agree to calm mode, let's add to the screens when calm mode is on or off, let's not just keep the toggle. I agree with the color idea, let's do it. Give me the figma make prompt for this."
What I used / changed: Reviewed the generated prompts before pasting into Figma Make. Confirmed that the CSS .calm class approach was correct and wouldn't break existing animations for users not in calm mode. Applied as-is after review.

Entry 4
Date: Oct 29, 2026
 Who: Rishi Kataria
 Tool: Claude Sonnet 4.6
 Purpose: Fix Mo popup looking AI-generated (mixed emoji icon styles), and decide Mo's position - floating button vs nav tab.
Prompt:
"Badges, rewards, Journey - these sections should be happening, does it look like? Also when clicked on Mo, it shows this - looks AI created it - not good. I was thinking to keep Mo floating (bottom right) - what's your suggestion?" [+ 3 screenshots]
What I used / changed: Agreed with the recommendation to move Mo to a floating button (bottom-left, not right, to avoid CTA collision - Claude explained the collision risk and I agreed after checking the layout). Replaced emoji icons in Mo popup with consistent SVG line icons - reviewed each icon visually before applying. Rejected the initial bottom-right position after Claude explained the CTA collision risk.

Entry 5
Date: Oct 30, 2026
 Who: Rishi Kataria
 Tool: Claude Sonnet 4.6
 Purpose: Resolve conflict between teammate Shreeya's Mo redesign prompt and our existing prompts. Teammate specified "do not change anything else in the app."
Prompt:
"[Teammate's Mo redesign prompt pasted in full] One of my teammates added this prompt before us, so if anything is conflicting from our prompt with this, you can update our prompt and give me again."
What I used / changed: Claude identified one real conflict - our prompt specified explicit radial gradient hex values, but teammate's prompt said to keep MoGradientContext with fill={v.fill}. Accepted the fix - removed gradient overrides entirely. All other parts were confirmed clean. Pasted teammate's Mo prompt first as instructed, then ours after. Ordering was my decision based on teammate's explicit scope instruction.

Entry 6
Date: Oct 31, 2026
 Who: Rishi Kataria
 Tool: Claude Sonnet 4.6
 Purpose: Address 8 Figma comments from teammate Shreeya - background consistency, angry screen, Mo/nav color clash, badge colors, "Gaming" label under profile name, empty space on home, icon system unification, debrief layout.
Prompt:
"[8 Figma comment screenshots shared] Let's not show gaming below the name. Ask me questions if you have doubt, if not let's solve this. Icons which are kept on step 1 are best, let's use it throughout the app. Any doubts ask me, if not then go ahead and make figma make."
What I used / changed: Reviewed each of the 8 fixes before applying. For icon unification, I confirmed the step 1 icon treatment (48×48 rounded square, tinted bg + 24px SVG) was what we wanted applied everywhere - my design judgment, Claude implemented the spec. Removed "Gaming" subtitle from Me screen as Shreeya requested. Kept empty space on home intentionally (neurodivergent users benefit from visual breathing room) - explained this to Claude and it adapted the fix to just increase spacing rather than fill.

Entry 7
Date: Nov 1, 2026
 Who: Rishi Kataria
 Tool: Claude Sonnet 4.6
 Purpose: 5-screen polish pass - Mo popup icons, Today's Practice card redesign, practice gate bottom sheet collision, angry screen empty space, breathe screen timer.
Prompt:
"CTA is floating and text is behind, looks very odd, can you give me suggestions or ideas to make this look good."
"Home page - Today's practice card is looking Claude created, change it. When pressed on Mo, icons should be consistent and I am not liking Mo is placed with a dark background. Make it on a lighter background which has shadow and keep same to bottom navigation."
"When clicked on circles and practising - Mo, Bottom nav and want to warm up first slider from below is clashing, make sure you do something which makes this good."
"I'm okay now and arrow is weird, make this text link look better visual and copy wise." [+ 6 screenshots]
What I used / changed: Changed Mo button from dark to light background (my call - disagreed with original spec after seeing it on screen). Changed exit copy from "I'm okay now ←" to "I'm feeling better" - Claude suggested the copy, I agreed it was warmer. Added Mo nudge card to fill angry screen empty space - I decided to include this after seeing the before/after. The breathe animation timing spec (4s in / 1s hold / 6s out) was applied and I verified it felt right before including.

Entry 8
Date: Nov 2, 2026
 Who: Rishi Kataria
 Tool: Claude Sonnet 4.6
 Purpose: Make Mo draggable to any corner of the device. Add status bar (time, signal, wifi, battery) and notification bell in home header.
Prompt:
"Mo should be movable, it can be placed in any corner of the device. Add notification and status bar on the device." [+ reference screenshot showing notification pill + bell placement in header]
What I used / changed: The snap-to-corner behavior on pointer up was my specific requirement - I wanted it to feel intentional, not just float anywhere. Notification bell placement: Claude initially put it in the status bar - I corrected this with a screenshot showing it belongs in the page header next to the "4 brave steps" pill. Used the drag clamping spec; verified corner positions made sense on iPhone 15 Pro dimensions.

Entry 9
Date: Nov 3, 2026
 Who: Rishi Kataria
 Tool: Claude Sonnet 4.6
 Purpose: Fix Dawn and Sage color themes looking identical. Fix all screens being clipped by status bar overlay. Move notification to correct position.
Prompt:
"Notification should be exactly where I showed a screenshot of it as an example. Rest all the screens - as soon as I click on it top part is cut a bit. And you know the device so add the top status bar accordingly. Are Dawn and Sage the same color? Looks like." [+ 6 screenshots]
What I used / changed: Confirmed Dawn and Sage were identical (both using same hex). Accepted the color distinction: Dawn → #8FAABB (blue-grey), Sage stays green. Applied 44px padding-top to all screen scroll containers. I added the Colors screen preview strip idea after Claude suggested it - hadn't thought of that detail but it makes the feature feel real.

Entry 10
Date: Nov 3, 2026
 Who: Rishi Kataria
 Tool: Claude Sonnet 4.6
 Purpose: Fix CTA buttons overlapping content on all screens - global fix across the whole app.
Prompt:
"CTA buttons all over the place, fix this." [+ 3 screenshots showing collisions on onboarding step 3, add-person screen, and practice list screen]
What I used / changed: Applied global CTA rule: position fixed, bottom calc(90px + safe-area-inset-bottom), left/right 20px, height 56px, border-radius 999px. Verified z-index layering (nav > Mo > CTA) made sense - CTA is below Mo so Mo stays tappable. Added padding-bottom to all scroll containers. This was a systematic fix applied to every screen at once rather than one at a time.

Entry 11
Date: Nov 4, 2026
 Who: Rishi Kataria
 Tool: Claude Sonnet 4.6
 Purpose: Remove nav from text-input screens, fix input bar position, add Apple-accurate simulated keyboard for pitch demo.
Prompt:
"When I am coming on this screen or on any screen which has text box, it shouldn't be having bottom navigation and it should show text box and arrow sign and it should be fixed below. When clicked on text box the keypad should open and manually typing should be allowed as it is in social media apps. Not only here, on all the screens which has text box below. Make sure the keypad is of Apple phone (fitting perfect in the device) and UX should be smooth like a real phone." [+ screenshot of practice reply screen]
What I used / changed: The visualViewport resize API for keyboard-aware layout was Claude's implementation - I verified this was the correct browser API for this. The 4-row QWERTY layout with shift/caps/numbers switch was applied. I decided to simulate the keyboard rather than use native (since Figma Make prototype environment doesn't trigger native iOS keyboard reliably during pitch demo). Number layout row was added per my request during review.

Entry 12
Date: Nov 5, 2026
 Who: Rishi Kataria
 Tool: Claude Sonnet 4.6
 Purpose: Fix "undefined" appearing in all text inputs when keyboard was used. Fix "Start practice" CTA inconsistency. Fix Say hi → Mom DM keyboard not working.
Prompt:
"In My people screen, when I am clicking on Say hi, it takes me to the next screen and then keyboard is not working it says undefined. Make sure it works everywhere on the whole app."
"Also, on Start practice screen why that button is different from otherwise, I had only asked to keep it in the place of bottom navigation. Keep consistency throughout the app." [+ 3 screenshots]
What I used / changed: Root cause was clear - input state initialized as undefined, so string concatenation produced "undefinedf". Applied ?? '' initialization to all input state keys and || '' fallback to every key handler. Confirmed the fix was global (all screens) not just the DM screen. Changed "Start practice" from edge-to-edge black to standard pill CTA matching every other screen - my call to maintain visual consistency.

Product Prompts (Built Into the App)
These are the AI-facing prompts built into the Bridge prototype that Mo uses when responding to users. Written collaboratively - I wrote the intent and constraints, Claude helped refine the language for clarity and safety.
Mo Practice Partner
Used in: practice reply screen, Mo hint bubble
"You are Mo, a kind, non-judgmental practice buddy for a neurodivergent young adult. Scenario: {scenario}. The user's goal is to practice {skill}. Give ONE short, friendly hint - not a script, just a nudge. Never tell them to 'sound more natural' or correct their grammar. Never send anything on their behalf."
Mo never auto-sends. All reply options are presented for user to choose or edit. Mo's hint appears before the user picks - not after - so it coaches rather than corrects.
Mo Check-in Response
Used in: check-in flow after user selects how they feel
"User said they feel: {ciFeel}. Respond in one short sentence, warm and grounded. If overwhelmed: validate and suggest something small. If ready: affirm and point to today's practice. Never diagnose, never give advice about medication or therapy."
Calm Mode Explanation
Used in: onboarding step 3, Comfort settings screen
"Calm mode turns off moving animations. Plain words drop the cheerful extras, like 'brave steps'. Changes save right away."

Rishi Kataria · rkatari6@asu.edu · Bridge · Team Ctrl Alt Elite · North American AI Challenge for Neurodiverse Learning 2026

