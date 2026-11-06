# Bridge AI integration

The clickable prototype in `figma-make/src/App.tsx` runs without an API key and keeps its
rule-based behavior. The production app under `app/` already sends bounded requests through
Amplify custom queries to Lambda, then calls Amazon Bedrock with IAM credentials. This guide
documents the production boundaries and the prompts those handlers use.

## Production AI boundaries

The live handlers are intentionally small and bounded:

1. **Practice** (`app/amplify/functions/practice/`): Mo plays the other person and gives feedback tied to the user's goal.
2. **Tone check** (`app/amplify/functions/tone/`): Mo explains a possible harsh phrase and suggests an optional rewrite.
3. **Reply ideas and event preview** (`preview/`): Mo returns short suggestions on request.
4. **Safety labels** (`classify/`): the deterministic keyword layer runs first, then the model only when needed.

Every handler validates input and structured model output, rate-limits where needed, and returns
a safe fallback when Bedrock is unavailable. Safety-sensitive paths also pass through the shared
`classify()` function before a response is shown or saved.

## Keep the key out of the app

Never put a model key in the browser or repository. Amplify provisions the Lambda role and the
frontend calls the authenticated custom query:

```
React app  --authenticated query-->  Amplify Lambda  --IAM role-->  Amazon Bedrock
```

- No model key is needed: the Lambda execution role grants the exact Bedrock resources it uses.
- Each function accepts only its documented task and caps input with its zod schema.
- Return JSON only. The app validates the shape and falls back to the rules if anything is missing.

## Prototype prompt reference

The following hook-point names describe the old Figma Make prototype only. In the production
build, the equivalent logic lives in the Lambda handlers listed above; do not add model calls to
`figma-make/src/App.tsx`.

### Level 3 practice feedback

**Where:** `evalOwn` in `App.tsx`, under the comment `Level 3: user types their own reply`. It returns `{ harsh, words, asks, kind, good }`.

**Replace with:** an async call made when the user taps Send on Level 3. Store the result in state (for example `pEval`) and read it where `ownEv` is used today.

**System prompt:**

```
You are Mo, a calm practice buddy in Bridge, an app that helps autistic and
neurodivergent young adults practice everyday social conversations.
You are role-playing {partner} in this scenario: {scenario_title}.
Context so far: {scenario_messages}.

The user just typed a reply. Do two things:
1. Reply as {partner} in one or two short, natural sentences.
2. Give the user feedback as Mo.

Rules for feedback:
- Start with one specific thing that worked. Then at most one tip.
- Plain, literal language. No sarcasm, idioms or exclamation-heavy praise.
- Never tell the user to act "more normal" or to mask. Different styles are fine.
- If the reply could sound harsh, say which words and why, and suggest a gentler
  version that keeps the user's meaning.
- No medical, diagnostic or therapy advice.

Return only JSON:
{"partner_reply": string, "worked": string, "tip": string | null,
 "sounds_harsh": boolean, "harsh_words": string[], "gentler_version": string | null,
 "good": boolean}
```

### Tone check before sending

**Where:**
- DMs: `harshWords`, `dmHarsh` and `harshHit` in the DMs section of `App.tsx`.
- Circle chat: `isAngry`, `toneLabel` and `toneWhy`.

**Replace with:** a call when the user pauses typing for about 600 ms, or when they tap Send. Keep the current UI. Only the source of `harsh`, `why` and the "Say it gently" text changes.

**System prompt:**

```
You check the tone of a chat message before an autistic or neurodivergent young
adult sends it to a peer they met in an interest group. Your job is to help them
decide, not to block or rewrite their voice.

Message: {draft}
Recent conversation: {last_3_messages}

Return only JSON:
{"might_sound_harsh": boolean,
 "why": string,            // one literal sentence, e.g. "'Whatever' can sound like you don't care what they said."
 "gentler_version": string // same meaning, kinder wording, about the same length
}
If the message is fine, return might_sound_harsh false, and empty strings for why and gentler_version.
```

The user always keeps **Send anyway**. Mo suggests and the user decides.

## Kept rule-based on purpose

- **Unsafe message holding** (requests for money, secrecy or meeting alone): keep this as fixed rules plus human moderation. It should never depend on a model's judgment.
- **Check-in to practice suggestions** (`recList`, `upNextText`): these are simple mappings that are easy to explain, and they already work.
- **Help and crisis** ("I need help", 988): always fixed text, never generated.

## Privacy

- Send only the current scenario or the last 3 messages, never names, emails or the trusted person's details.
- Don't store model inputs or outputs on the server.
- Say in Privacy & safety that practice replies and tone checks are processed by an AI model.
