# Bridge: Preview. Practice. Go.

Bridge walks a neurodivergent young adult through the whole journey of a real community event (before, during and after), with a coach who sets the goals and AI that carries the practice between sessions.

Built by **Team Ctrl Alt Elite** for the North American AI Challenge for Neurodiverse Learning (Spark Center for Innovation in Learning and ASU Enterprise Technology), in partnership with First Place AZ.

## Team

| Name | Focus | Contact |
|---|---|---|
| Tejas Shah | AI and engineering | [tshah44@asu.edu](mailto:tshah44@asu.edu) |
| Dhyey Patel | AI and engineering | [dpate408@asu.edu](mailto:dpate408@asu.edu) |
| Shreeya Bohra | User research, design and accessibility | [sbohra2@asu.edu](mailto:sbohra2@asu.edu) |
| Rishi Kataria | User research, design and accessibility | [rkatari6@asu.edu](mailto:rkatari6@asu.edu) |

All team members are graduate students at Arizona State University.

## What Bridge does

Bridge is an AI social coach for autistic and neurodivergent young adults, built with First Place AZ, who told us their residents want help socializing.

- **Daily check-in:** three taps (how I feel, what's coming up, what feels hard) shape the day. On overwhelmed days, Home shows just one small thing.
- **Practice with Mo:** role-play real moments at three levels (Guided, Light help, On your own) where support fades as skills grow.
- **Interest circles:** small groups with a daily topic, where reading without posting counts.
- **Messages:** a tone check before sending explains why something might sound harsh, and the user can still send it.
- **Events:** people, sound and lighting shown before you go, a prep checklist, a breather, and a short reflection after.
- **Comfort and control:** calm color themes, large text, calm mode, plain words, and a trusted person who sees only what the user chooses.

## How we built it

- **Research:** partner visits and a meeting with First Place AZ, the challenge kickoff, and a review of existing apps.
- **Design:** information architecture and user flows in Figma, iterated with teammate comments.
- **Prototype:** React (`figma-make/src/App.tsx`, `index.css`) built and previewed in Figma Make. Changes go in as small, reviewed commits. React (MIT) is the only third-party library so far; list new ones here with their license.
- **Typography:** Outfit by Rodrigo Fuenzalida, distributed under the SIL Open Font License 1.1. The production app serves local font files; the license is in `app/public/fonts/OFL-Outfit.txt`.
- **AI in the product:** Mo's practice feedback and tone checks are rule-based in the prototype. [docs/AI_INTEGRATION.md](docs/AI_INTEGRATION.md) shows where live model calls connect and how the API key stays out of the app.

## AI disclosure

We used AI tools while building Bridge, with a person reviewing every change:

- **Claude (Anthropic):** research summaries, idea write-ups, user-flow drafts, and React code for the prototype, plus the repo tooling (`scripts/hooks/`, `.claude/`). Earlier commits it helped write carry a `Co-Authored-By: Claude` line; newer commits do not, and this section is the record.
- **Figma Make AI:** applied code changes to the Figma Make prototype.
- **Codex (OpenAI):** reviewed the codebase and implemented the production onboarding flow from the exported Figma Make source, including typed components, validation, private contact persistence, and verification. Also implemented the daily check-in and Home from the Make export, with owner-only check-ins and weekly goals, live circle activity, real notifications, and account-isolation checks. Implemented Circles, Events, and private DMs, including server-authorized messaging and blocking, atomic RSVPs, reminders, and live verification.

The team chose the partner, the problem, the features and every design decision. Each teammate's prompts are in [AI_PROMPTS/](AI_PROMPTS/).

## Run the prototype

Open the [Figma Make file](https://www.figma.com/make/CmV9IOc2bubFxzcPJzz4Q7), or copy `figma-make/src/App.tsx` and `figma-make/src/index.css` into any Vite + React project and run `npm run dev`. No API keys are needed.

## For AI assistants

Read `.claude/skills/bridge/SKILL.md` before doing anything. Every prompt is logged to `AI_PROMPTS/<Name>.md`, `git pull --rebase --autostash` comes before every push, and nothing is mocked.
