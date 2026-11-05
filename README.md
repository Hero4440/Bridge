# Bridge: Preview. Practice. Go.

Bridge helps neurodivergent young adults practice social moments safely with Mo, an AI buddy, then use those skills with real people: new people they meet through shared interests, and people they already know.

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

- **Daily check-in:** how I feel, what's coming up, and what I'd like help with (meeting new people, staying close to people I know, handling tricky moments, or talking at work or school). Home and today's practice follow the answer, and on overwhelmed days Home shows just one small thing.
- **Practice with Mo:** role-play real moments, including catching up with a friend, fixing a misunderstanding and asking a boss for help, at three levels (Guided, Light help, On your own) where support fades as skills grow. Every level has a box to answer in your own words.
- **My people:** family, roommates and coworkers the user already knows, with a gentle nudge to say hi in their own words.
- **Interest circles:** small groups with a daily topic, where reading without posting counts.
- **Messages:** a tone check before sending explains why something might sound harsh, and the user can still send it. Mo's reply ideas stay hidden until asked for, and the user can turn Mo's help down from Lots to When I ask.
- **Events:** people, sound and lighting shown before you go, a prep checklist, a breather, and a short reflection after.
- **Comfort and control:** calm color themes, large text, calm mode, plain words, and a trusted person who sees only what the user chooses.

## How we built it

- **Research:** partner visits and a meeting with First Place AZ, the challenge kickoff, and a review of existing apps.
- **Design:** information architecture and user flows in Figma, iterated with teammate comments.
- **Design prototype:** React (`figma-make/src/App.tsx`, `index.css`) built and previewed in Figma Make. It runs on rule-based logic with no API key, so the design can be clicked through anywhere. Partner feedback from Josh Munoz at First Place AZ shaped the latest round: user-chosen goals, My people, fading reply ideas, and a calmer warm color system.
- **Production app:** `app/` is a React + Vite app on AWS Amplify Gen 2 (Cognito sign-in, DynamoDB, Lambda). See [app/README.md](app/README.md).
- **AI in the product:** in the production app, Mo runs on Claude through Amazon Bedrock from Lambda functions: Sonnet 4.5 plays the practice partner and gives one strength and one tip; Haiku 4.5 checks tone, suggests reply ideas and classifies messages for safety. Every call is validated and rate-limited, falls back to safe text on failure, and never sends a message for the user. Prompts live in `app/amplify/functions/*/prompts.ts`; access uses AWS IAM roles, so no keys are stored in the repo.

## AI disclosure

We used AI tools while building Bridge, with a person reviewing every change:

- **Claude (Anthropic):** research summaries, idea write-ups, user-flow drafts, and React code for the prototype, plus the repo tooling (`scripts/hooks/`, `.claude/`). Earlier commits it helped write carry a `Co-Authored-By: Claude` line; newer commits do not, and this section is the record.
- **Figma Make AI:** applied code changes to the Figma Make prototype.

The team chose the partner, the problem, the features and every design decision. Each teammate's prompts are in [AI_PROMPTS/](AI_PROMPTS/).

## Run the prototype

Open the [Figma Make file](https://www.figma.com/make/nNkx4mz0eXrSNIZtCBuxRK/Bridge-Independence-App--2-), or copy `figma-make/src/App.tsx` and `figma-make/src/index.css` into any Vite + React project and run `npm run dev`. No API keys are needed.

## For AI assistants

Read `.claude/skills/bridge/SKILL.md` before doing anything. Every prompt is logged to `AI_PROMPTS/<Name>.md`, `git pull --rebase --autostash` comes before every push, and nothing is mocked.
