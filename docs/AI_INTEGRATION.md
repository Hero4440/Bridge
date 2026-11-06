# Bridge AI integration

This describes the production implementation under `app/`. The Figma Make export
under `figma-make/` is a separate, rule-based design prototype. Earlier prototype
integration proposals remain available in Git history; the executable prompts
linked below are the source of truth for the current build.

## Request path and models

```text
React app → Cognito-authenticated AppSync operation → Lambda → Amazon Bedrock
```

The AI queries are defined in [the data schema](../app/amplify/data/resource.ts).
Lambda uses its IAM execution role to invoke Bedrock; the browser needs no model
API key. [Model configuration](../app/amplify/shared/config.ts) defaults to Claude
Sonnet 4.5 for practice and Mo chat, and Claude Haiku 4.5 for the other model tasks.
Environment overrides can change those model IDs. The Bedrock client uses
`us-east-1`; the configured US inference profiles can route inference across regions.

| AppSync query | Handler and prompt source | Behavior |
|---|---|---|
| `practiceTurn` | [practice/](../app/amplify/functions/practice/) | Start, continue, and finish bounded role-play at three support levels; feedback gives one strength and one tip against the person's goal. |
| `moChatTurn` | [moChat/](../app/amplify/functions/moChat/) | Conversational support with current request context and saved practice feedback memory. |
| `toneCheck` | [tone/](../app/amplify/functions/tone/) | Keyword explanations and an optional model-generated gentle rewrite. |
| `previewReplies` | [preview/](../app/amplify/functions/preview/) | One to three short reply or opener suggestions. |
| `classifyText` | [classify/](../app/amplify/functions/classify/) and [shared classifier prompts](../app/amplify/functions/shared/classify-prompts.ts) | Shared crisis, money, address, unsafe, bias, or safe labeling. |
| `reflectReply` | [reflectReply/](../app/amplify/functions/reflectReply/) | A short response to the person's reflection feeling and selected wins. |
| `getDailyTopic` | [dailyTopic/](../app/amplify/functions/dailyTopic/) | A conversation starter cached by circle and UTC date in the `Topic` model. Concurrent cache misses can each call the model. |

System prompts and tool schemas live in each handler directory's `prompts.ts`,
with classifier prompts under `shared/`. Development prompt records and app-prompt
entries are in [AI_PROMPTS/](../AI_PROMPTS/); tool attribution is in the
[root README](../README.md#ai-disclosure).

## Validation, safety, and failure behavior

[The shared Bedrock helper](../app/amplify/functions/shared/bedrock.ts) uses Converse
with a forced tool schema and validates the tool result with zod. It caps output
at 500 tokens and uses temperature 0.2. Its default per-call timeout is five
seconds; practice and Mo chat request fifteen seconds. Classification and other
calls add to the full request duration, so these are not end-to-end deadlines.
Invalid model output, timeouts, and invocation errors return a failure result
that handlers convert to scripted responses marked `fallback: true`.

[The shared classifier](../app/amplify/functions/shared/classify.ts) checks keywords
first and invokes Haiku when no keyword label applies. Its model-failure default
is `unsafe`. Practice and Mo chat classify input and generated response text;
crisis input returns fixed help wording before the normal rate-limit/model path.
Tone checks collect keyword reasons before calling the rewrite model. These
checks differ by handler: tone, preview, reflection, and daily topics do not run
the same input/output classifier sequence as practice and Mo chat.

Practice, Mo chat, tone, and preview use the shared DynamoDB rate limiter
(100 requests per user per hour). The standalone classifier, reflection reply,
and daily-topic handlers do not call that limiter. The limiter allows requests
when `RATE_LIMIT_TABLE` is absent; deployment wiring matters. Backend IAM, alarms, and budget resources are defined in
[backend.ts](../app/amplify/backend.ts). Reserved concurrency is currently disabled
there because of the account concurrency quota.

Suggestions and rewrites do not send chat messages. The person reviews them and
chooses whether to send; normal tone warnings offer **Send anyway**. Message
requests and blocking are enforced by the messaging/community server handlers,
separately from suggestion generation.

## Context, persistence, and logs

[Client context](../app/src/lib/moContext.ts) can include the person's first name,
interests, comfort preferences, session check-in, current screen, and up to three
recent relevant messages. It is capped at 1,600 characters. It does not explicitly
include profile email or trusted-contact fields, although free text can contain
personal information. Context supplied to a model is treated as data in the prompt.

Practice also sends the chosen scenario, level, goal, and bounded conversation
history. On finish, it stores an owner-only `PracticeRun` with scenario, level,
goal, and generated feedback memory (memory, strength, and tip). The current
handler does not persist raw practice turns. Practice and Mo chat can retrieve
saved feedback for subsequent requests; Mo chat also accepts transient chat
history. Its handler does not persist that chat history.

Reflections and generated daily topics have their own data records. Consequently,
this application does store selected inputs and generated content; it should not
be described as storing no model inputs or outputs. App privacy wording must
explain what is sent to Amazon Bedrock and what practice memory is retained.

[Structured turn logs](../app/amplify/functions/shared/log.ts) contain metadata
such as function, scenario, level, latency, labels, and fallback status. This
helper does not log user messages, raw practice turns, or generated reply text.

## Verification

From `app/`, run `npm test`, `npm run lint`, and `npm run build`. Handler and shared
helper tests use isolated test doubles to check validation, safety, persistence,
and failure paths. They do not prove that a deployed Bedrock model is reachable.
Use a signed-in fictional account in your personal sandbox to verify live model
responses and fallback behavior. See [the app guide](../app/README.md) for setup
and [the deployment runbook](DEPLOYMENT.md) for Hosting configuration.
