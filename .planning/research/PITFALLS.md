# Pitfalls Research: AWS Amplify Gen 2 + Bedrock Integration

**Domain:** First-time Amplify Gen 2 backend with Bedrock AI for production deployment
**Researched:** 2026-11-03
**Confidence:** HIGH (official docs, recent practitioner reports, GitHub issues)

---

## Critical Pitfalls

### Pitfall 1: Budget Overruns from Bedrock Calls

**What goes wrong:**
Teams receive $30,000+ AWS bills with no warning. Default Bedrock quotas are shockingly low (25 requests/minute for Opus 4.6, ~100 for Sonnet), but costs accumulate silently. A single forgotten test loop or aggressive retry logic can burn through budgets in hours.

**Why it happens:**
- No cost guards set before first Bedrock call
- Testing with production models instead of cheaper alternatives
- No per-user rate limiting
- Missing AWS Budgets alerts
- Unbounded input length and maxTokens

**How to avoid:**
1. **Set AWS Budgets FIRST** (before any Bedrock call): 50/80/100% email alerts to whole team
2. **Lambda reserved concurrency** on AI functions (caps parallel executions)
3. **Per-user rate limit** via DynamoDB counter with TTL (SKILL.md 1.4 requirement)
4. **Cap input length** and set explicit `maxTokens` (e.g., 500 for feedback, 1000 for practice)
5. **Start with Haiku** for testing, graduate to Sonnet only when needed
6. **Request quota increase** to 500 RPM before team starts heavy testing

**Warning signs:**
- No AWS Budgets configured in console
- `maxTokens` missing from Converse calls
- No rate limiting code in Lambda functions
- Cost dashboard shows increasing Bedrock charges without corresponding user activity

**Phase to address:**
Phase 1 (Infrastructure setup) — budget guards are MANDATORY before any AI endpoint goes live

**Deadline impact:** CRITICAL — can blow competition budget before demo day

---

### Pitfall 2: Cross-Region Inference Profile IAM Permissions

**What goes wrong:**
`AccessDeniedException` when calling Bedrock despite having model permissions. Cross-region inference profiles route requests to multiple regions behind the scenes, requiring IAM permissions for BOTH the profile ARN AND every foundation model ARN in every destination region.

**Why it happens:**
- IAM policy grants only the inference profile ARN
- Missing account ID in inference-profile ARN format
- Foundation model permissions missing in destination regions
- SCP restrictions on Bedrock in certain regions

**How to avoid:**
```typescript
// backend.ts - CORRECT IAM setup for cross-region inference profile
backend.practice.resources.lambda.addToRolePolicy(new PolicyStatement({
  actions: ['bedrock:InvokeModel'],
  resources: [
    // Inference profile ARN (must include account ID)
    'arn:aws:bedrock:us-east-1:123456789012:inference-profile/us.anthropic.claude-3-5-sonnet-20241022-v2:0',
    // Foundation model ARNs in ALL destination regions
    'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0',
    'arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0',
    'arn:aws:bedrock:eu-west-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0'
  ]
}));
```

**Warning signs:**
- Error: "User is not authorized to perform: bedrock:InvokeModel"
- IAM policy uses bare model IDs instead of inference profile IDs
- Policy has inference profile but no foundation-model ARNs

**Phase to address:**
Phase 1 (Infrastructure) — verify with `aws bedrock list-inference-profiles --region <r>` before deploying

**Deadline impact:** HIGH — blocks all AI features until IAM is correct

---

### Pitfall 3: TypeScript Type Generation Failures on Large Schemas

**What goes wrong:**
`TS2590: Expression produces a union type that is too complex to represent` or `TS2589: Type instantiation is excessively deep` errors prevent deployment. Since @aws-amplify/backend-deployer 2.3.1, TypeScript 5.8 type-checks during deploy and fails on complex schemas that work locally.

**Why it happens:**
- Many data models with deep relationships (User → Contact → GuardianLink → Notification → Report...)
- Types not regenerated after schema changes
- Local TypeScript cache out of sync
- TypeScript 5.8 requires more type work than 5.9/6.0

**How to avoid:**
1. **Regenerate types after EVERY schema change**: `npx ampx generate graphql-client-code`
2. **Clear TypeScript cache**: `npx tsc --build --clean` then restart dev server
3. **Simplify authorization rules** where possible (fewer `allow.*` combos = simpler types)
4. **Test deploy early** (don't wait until final push to discover type errors)
5. **Keep schema flat** — prefer denormalization over deep nesting for Bridge's scope

**Warning signs:**
- Frontend types (graphql/API.ts) missing or stale
- TS errors in `client.models.*.create()` calls
- Local `npx tsc --noEmit` passes but deploy fails

**Phase to address:**
Phase 1 (Data modeling) — test deploy after defining User/Message/Event/PracticeRun schema

**Deadline impact:** HIGH — can block all deployments 24 hours before demo

---

### Pitfall 4: AppSync Subscription Disconnects and Filter Errors

**What goes wrong:**
Live chat subscriptions disconnect after 2-3 minutes of inactivity. Authorization errors (`UnauthorizedException`) during connection. Subscription filters return validation errors like "has invalid filter value for operator". Mutations don't trigger real-time updates for related models.

**Why it happens:**
- Subscriptions disconnect on inactivity (no keepalive)
- Authorization rules conflict (e.g., `allow.owner()` + `allow.groups()` precedence)
- Filter syntax errors in subscription configuration
- Missing authenticated permissions on subscription fields
- Mutations on one model don't cascade to subscriptions on related models

**How to avoid:**
1. **Keep subscriptions simple**: `client.models.Message.observeQuery()` for circle chat
2. **Test with 2 accounts**: verify both see live updates, check authorization rules
3. **Dynamic group auth**: subscriptions only work if user is in ≤5 groups (Amplify limit)
4. **Error handling**: reconnect on disconnect, show "reconnecting..." UI
5. **Avoid complex filters**: stick to single-field equality filters

**Warning signs:**
- Chat works initially but stops updating after a few minutes
- "UnauthorizedException" in browser console during subscription connection
- One user sees messages, another doesn't (authorization issue)
- Mutations succeed but subscriptions don't fire

**Phase to address:**
Phase 2 (Live chat) — build reconnection logic and test with 2 simultaneous users

**Deadline impact:** HIGH — live chat demo fails if subscriptions break

---

### Pitfall 5: Bedrock Converse API Structured Output Mistakes

**What goes wrong:**
`classify()` function returns unparseable JSON or validation errors. Bedrock returns free-form text instead of structured JSON. `toolConfig` serialization fails in Step Functions. Missing `type` field causes ParamValidationError.

**Why it happens:**
- Using `outputConfig.textFormat` without required `type` field
- Not validating output with zod after Bedrock call
- Assuming all models support structured output (Nova models don't)
- Misunderstanding `strict: true` on toolSpec vs `outputConfig.textFormat`

**How to avoid:**
```typescript
// classify.ts - CORRECT structured output via toolConfig
const response = await bedrock.converse({
  modelId: INFERENCE_PROFILE_ID,
  messages: [{ role: 'user', content: [{ text }] }],
  toolConfig: {
    tools: [{
      toolSpec: {
        name: 'classify',
        description: 'Classify text into categories',
        inputSchema: {
          json: {
            type: 'object',
            properties: {
              label: { type: 'string', enum: labels },
              confidence: { type: 'number', minimum: 0, maximum: 1 }
            },
            required: ['label', 'confidence']
          }
        }
      }
    }],
    toolChoice: { tool: { name: 'classify' } }
  }
});

// Validate with zod
const result = ClassifySchema.parse(
  response.output.message.content[0].toolUse.input
);
```

**Warning signs:**
- Free-form text in Bedrock responses instead of JSON
- `ParamValidationError: Missing required parameter`
- Zod validation failures on Bedrock output
- Different output formats from sandbox vs production

**Phase to address:**
Phase 1 (classify function) — test with all label categories before using in other features

**Deadline impact:** MEDIUM — breaks safety features and tone check if `classify()` fails

---

### Pitfall 6: Sandbox vs Production Environment Differences

**What goes wrong:**
Features work in sandbox (`npx ampx sandbox`) but fail in production deployment. Secrets set in sandbox aren't available in production. GSI modifications take 10+ minutes in production but are instant in sandbox (table recreated). Different IAM policies between environments.

**Why it happens:**
- Secrets are environment-specific (sandbox vs console-managed)
- Sandbox shortcuts for DX (table recreation) don't apply in production
- Different CloudFormation stacks for sandbox vs pipeline-deploy
- Sandbox uses developer's AWS credentials; production uses pipeline role

**How to avoid:**
1. **Set secrets in Amplify console** for production branch (not just sandbox)
2. **Test GSI changes early**: schema changes with indices take longer in prod
3. **Use `amplify.yml` for pipeline**: `npx ampx pipeline-deploy --branch main --app-id $AWS_APP_ID`
4. **Test with production IAM**: verify Lambda has correct Bedrock permissions in deployed stack
5. **Never commit `amplify_outputs.json`**: each environment generates its own

**Warning signs:**
- Works locally but fails after merge to main
- "Secret NAME not found" errors in production logs
- 10+ minute deployments for schema changes
- Different API endpoints between sandbox and production

**Phase to address:**
Phase 3 (Deployment) — deploy to production branch 24 hours before demo

**Deadline impact:** HIGH — last-minute production issues can't be debugged during demo

---

### Pitfall 7: Lambda Cold Starts with Bedrock Latency Spikes

**What goes wrong:**
First Bedrock call after inactivity takes 8-15 seconds. Lambda cold starts add 200ms-1.8s on top. User sees loading spinners for 10+ seconds on first practice session, thinks app is broken.

**Why it happens:**
- Bedrock spins down unused inference capacity
- Lambda cold starts for Node.js/Python (though faster in 2026: <200ms)
- No SDK retry configuration for throttling
- Missing fallback when Bedrock times out

**How to avoid:**
1. **Implement fallback replies**: return scripted response if Bedrock > 5s or throttled
2. **SDK retry config**: let SDK handle transient throttles before falling back
3. **Reserved concurrency**: keep 1-2 Lambda instances warm for AI functions
4. **Show realistic loading UI**: "Mo is thinking... (this takes a few seconds the first time)"
5. **Test after 1+ hour inactivity**: reproduce cold Bedrock behavior

```typescript
// practice.ts - fallback for slow/failed Bedrock calls
try {
  const response = await bedrock.converse({...}, { requestTimeout: 5000 });
  return { strength: '...', tip: '...', fallback: false };
} catch (error) {
  if (error.name === 'TimeoutError' || error.$metadata?.httpStatusCode === 429) {
    return {
      strength: "You're engaging with the scenario",
      tip: "Try asking a follow-up question to keep the conversation going",
      fallback: true // log this for monitoring
    };
  }
  throw error;
}
```

**Warning signs:**
- 10+ second delays on first AI call after inactivity
- Timeout errors in Lambda logs
- CloudWatch shows sporadic Bedrock latency spikes
- Users report "loading forever" on first practice

**Phase to address:**
Phase 2 (AI endpoints) — implement fallback before demo testing

**Deadline impact:** MEDIUM — poor UX if judges hit cold starts, but doesn't block demo

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoded model ID instead of inference profile | Faster setup | Can't use cross-region routing, lower quotas | Never (quotas too low) |
| No per-user rate limiting | Simpler Lambda code | Budget overruns, abuse risk | Never (competition requirement) |
| Skipping zod validation on Bedrock output | Fewer dependencies | Runtime errors from malformed AI responses | Never (safety-critical) |
| Using Opus for testing | "Better" results | 10x higher costs than Haiku | Never (use Haiku, validate with Sonnet) |
| Polling instead of subscriptions | Easier to implement | AppSync costs, poor UX, violates "build like production" | Never (real-time required) |
| Shared IAM role for all Lambdas | Single policy to maintain | Violates least privilege, harder to debug permissions | Never (security anti-pattern) |
| `allow.authenticated()` on all models | Fast prototyping | Anyone can read/modify anyone's data | Only for truly public data (Topics, Circles) |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Bedrock Converse API | Checking `content.type` to detect completion instead of `stopReason` | Check `stopReason === 'tool_use'` or `'end_turn'` |
| Bedrock tool results | Missing assistant message in history before tool result | Include assistant message with toolUse before sending toolResult |
| AppSync subscriptions | Combining `allow.owner()` + `allow.groups()` without understanding precedence | Test with 2 accounts; groups rule takes precedence over owner |
| Amplify Gen 2 secrets | Setting secrets in sandbox and expecting them in production | Set secrets in Amplify console for production branch separately |
| TypeScript types | Assuming types auto-update after schema changes | Run `npx ampx generate graphql-client-code` after EVERY schema change |
| Cognito authorization | Using `allow.authenticated()` for owner-specific data | Use `allow.owner()` for Reflection/PracticeRun; `allow.authenticated()` for reading Events |
| Lambda + Bedrock IAM | Granting only bedrock:InvokeModel without specific model ARNs | Grant both inference-profile ARN and foundation-model ARNs in all destination regions |
| DynamoDB TTL | Assuming TTL deletes happen instantly | TTL deletes are eventual (48 hours); don't rely on them for real-time cleanup |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| No maxTokens cap | Bedrock calls take 30+ seconds, high costs | Set `maxTokens: 500` for feedback, 1000 max | First long practice session |
| Unbounded input length | User pastes 10,000-word message, timeout | Truncate to 2000 chars before Bedrock call | User testing / demo |
| N+1 queries on Message list | Circle chat loads 100 messages with 100 separate User queries | Use DynamoDB batch get or denormalize user name into Message | 50+ messages in circle |
| Missing DynamoDB GSI | Querying by non-key field does full table scan | Add GSI for common queries (e.g., Event by circleId, Message by recipientId) | 100+ records |
| Subscription over-fetching | Subscribing to all Messages instead of filtering by circleId | Use subscription filters for circle/DM | 10+ concurrent users |
| Cold Bedrock calls | 8-15 second first-call latency after 1+ hour idle | Implement fallback, set realistic loading UI | First practice after idle period |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| `allow.authenticated()` on Reflection/PracticeRun | Anyone can read anyone's practice transcripts | Use `allow.owner()` for private user data |
| No input validation before Bedrock | Prompt injection, unsafe content sent to model | Run `classify(text, ['crisis', 'money', 'address'])` BEFORE Bedrock call |
| Storing raw practice transcripts | Privacy violation (SKILL.md 2.8) | Store only: hints used, level, strength/tip feedback |
| Missing `allow.resource(fn)` for Lambda Data client | Lambda can't query DynamoDB on user's behalf | Add `.authorization(allow => [allow.authenticated(), allow.resource(practiceFn)])` |
| Hardcoded AWS credentials | Leaked in git history, console logs | Use IAM roles only; never `AWS_ACCESS_KEY_ID` in code/env |
| No content filtering on AI output | Bedrock could return unsafe/biased responses | Run `classify(output, ['unsafe', 'bias'])` AFTER Bedrock call |
| Missing 988 crisis detection | App can't handle "I want to hurt myself" | `classify()` must detect crisis label and show 988 + trusted person |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No loading state for Bedrock calls | User thinks app froze, closes browser | Show "Mo is thinking..." with realistic time estimate (3-5 seconds) |
| No fallback when Bedrock fails | Dead-end screen, can't continue practice | Return scripted feedback with `fallback: true` flag |
| Subscription disconnect without reconnect | Chat stops updating, user refreshes page | Auto-reconnect on disconnect, show "reconnecting..." banner |
| No offline state for Lambda errors | Network error looks like bug | Show "Can't reach server" with retry button |
| Empty circle chat with no prompt | User stares at blank screen, doesn't know what to do | Show chat starter chips: "Ask a question", "Share mine" |
| Practice feedback too slow | 10+ second wait after each reply | Optimize: keyword-based hints (instant), LLM only for strength/tip |
| No error message on invalid RSVP | Button doesn't work, no feedback | Show "Event is full" or "Already registered" toast |

---

## "Looks Done But Isn't" Checklist

- [ ] **Budget guards:** AWS Budgets created with 50/80/100% alerts to whole team
- [ ] **Rate limiting:** Per-user Bedrock call counter in DynamoDB with TTL
- [ ] **IAM permissions:** Both inference-profile AND foundation-model ARNs in all destination regions
- [ ] **TypeScript types:** Regenerated after EVERY schema change (`npx ampx generate graphql-client-code`)
- [ ] **Subscription reconnect:** Auto-reconnect logic + "reconnecting..." UI for dropped connections
- [ ] **Bedrock fallback:** Scripted reply when Bedrock times out or throttles
- [ ] **Input validation:** `classify()` runs BEFORE sending to Bedrock (crisis, money, address detection)
- [ ] **Output validation:** Zod schema validates Bedrock JSON response structure
- [ ] **2-account testing:** Live chat, subscriptions, authorization rules tested with 2 simultaneous users
- [ ] **Cold start testing:** Test practice after 1+ hour idle to verify fallback works
- [ ] **Production secrets:** Set in Amplify console for main branch (not just sandbox)
- [ ] **No raw transcripts:** PracticeRun stores only hints/level/feedback, never full message history
- [ ] **Crisis handling:** `classify()` detects "I want to hurt myself" and shows 988 + trusted person
- [ ] **Owner-only data:** `allow.owner()` on Reflection/PracticeRun; `allow.authenticated()` only for public data

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Budget overrun detected | LOW | Set AWS Budgets with hard stop Lambda; switch to Haiku; add per-user rate limits |
| IAM permissions wrong in production | LOW | Update policy in backend.ts, redeploy (10 mins); test with `aws bedrock invoke-model` |
| TypeScript type errors block deploy | LOW | `npx ampx generate graphql-client-code`, clear cache, retry deploy |
| Subscriptions disconnecting | MEDIUM | Add reconnect logic + UI, test with 2 users, verify authorization rules |
| Bedrock returning unparseable output | LOW | Add zod validation, implement fallback for validation failures |
| Sandbox secrets missing in prod | LOW | Set secrets in Amplify console for main branch, redeploy |
| Cold starts causing timeouts | MEDIUM | Implement fallback logic, adjust Lambda timeout to 10s, add loading UI |
| Wrong authorization (data leaks) | HIGH | Fix schema `allow.*` rules, redeploy, verify with 2 test accounts, may need to migrate data if leaked |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Budget overruns | Phase 1 (Infrastructure) | AWS Budgets dashboard shows alerts configured; per-user rate limit in DynamoDB |
| IAM permissions | Phase 1 (Infrastructure) | `aws bedrock invoke-model` succeeds from deployed Lambda |
| TypeScript types | Phase 1 (Data modeling) | `npx tsc --noEmit` passes; deploy succeeds; frontend types match schema |
| AppSync subscriptions | Phase 2 (Live chat) | 2 accounts see real-time messages; reconnect works after disconnect |
| Bedrock structured output | Phase 1 (classify function) | All label categories tested; zod validation passes; fallback tested |
| Sandbox vs production | Phase 3 (Deployment) | Main branch deploys successfully; secrets available; features work in prod |
| Cold starts / latency | Phase 2 (AI endpoints) | Practice works after 1+ hour idle; fallback triggers on timeout; loading UI shown |

---

## Sources

### Official Documentation
- [AWS Amplify Gen 2 Documentation - Subscribe to real-time events](https://docs.amplify.aws/react/build-a-backend/data/subscribe-data/)
- [AWS Amplify Gen 2 - Customize auth rules](https://docs.amplify.aws/react/build-a-backend/data/customize-authz/)
- [AWS Amplify - Secrets and environment variables](https://docs.amplify.aws/react/deploy-and-host/fullstack-branching/secrets-and-vars/)
- [AWS Bedrock Converse API - Python SDK](https://docs.aws.amazon.com/sdk-for-python/v1/reference/clients/bedrock-runtime/operations/converse/)

### Practitioner Reviews & Case Studies (2026)
- [Amazon Bedrock Review (2026): Is It Production Ready? - TrueFoundry](https://www.truefoundry.com/blog/our-honest-review-of-amazon-bedrock-2026-edition)
- [AWS Bedrock: What Engineers Actually Found - Enterprise DNA](https://enterprisedna.co/resources/blog/practitioner-aws-bedrock-review/)
- [Building a Production-Ready Amazon Bedrock Client - Seddle](https://medium.com/@dustin_44710/building-a-production-ready-amazon-bedrock-client-lessons-from-seddle-45fff44a03d2)
- [AWS Amplify Gen 2 in Practice: Lessons on Speed and Scalability - Raft Labs](https://medium.com/@raftlabs/aws-amplify-gen-2-in-practice-lessons-on-speed-and-scalability-6ee4cc8615ef)

### Budget & Cost Control
- [Governing Amazon Bedrock Costs - AWS Re:Post](https://repost.aws/articles/AR5rBgrAyQStqFOiBYu88PDg/governing-amazon-bedrock-costs-team-and-user-level-tracking-budgets-and-hard-spend-controls-for-claude-code)
- [Scale Claude Code to hundreds of developers - AWS Builder](https://builder.aws.com/content/38FlN6HPBRK6WN6g9tRZD0DqZ3u/scale-claude-code-to-hundreds-of-developers-using-amazon-bedrock-with-self-managed-usage-limits)
- [AWS Bedrock Claude: $30,000 Invoice With No Warning](https://aiforautomation.io/news/2026-05-16-aws-claude-30k-invoice-bedrock-cost-guardrails)
- [AWS Publishes Jamf's Bedrock Budget Gate - Superpower Daily](https://superpowerdaily.com/posts/aws-publishes-jamf-s-bedrock-budget-gate-restricting-premium-models-at-80-spend)

### IAM & Permissions
- [Cross-Region Inference with Amazon Bedrock - AWS Builder](https://builder.aws.com/content/38ctvPLdCipntZ9Q2BmnZwDYihA/cross-region-inference-with-amazon-bedrock-optimizing-performance-cost-and-compliance)
- [Resolve AccessDeniedException in Amazon Bedrock - AWS Re:Post](https://repost.aws/knowledge-center/bedrock-access-denied-exception)
- [Cross-Region Inference Profile Required - Zenn](https://zenn.dev/hknote/articles/bedrock-haiku-inference-profile?locale=en)
- [Amplify AI Access Denied - GitHub Issue #3162](https://github.com/aws-amplify/amplify-category-api/issues/3162)

### TypeScript & Schema Issues
- [Amplify Gen 2 Schema Complexity TS2590 Error - GitHub Issue #424](https://github.com/aws-amplify/amplify-data/issues/424)
- [backend-deployer type-checks with TypeScript 5.8 - GitHub Issue #3373](https://github.com/aws-amplify/amplify-backend/issues/3373)

### AppSync Subscriptions
- [AppSync Subscription Disconnects After 2-3 Minutes - GitHub Issue #3976](https://github.com/aws-amplify/amplify-swift/issues/3976)
- [UnauthorizedException at AWSAppSyncRealTimeProvider - GitHub Issue #6938](https://github.com/aws-amplify/amplify-js/issues/6938)

### Bedrock Structured Output
- [Reliable JSON Output with Bedrock Tools - AWS Builder](https://builder.aws.com/content/329F2PHP3mpovBBJNPVBcVNCKmO/reliable-json-output-with-bedrock-tools)
- [Structured Outputs on Amazon Bedrock - AWS Samples](https://aws-samples.github.io/sample-ai-possibilities/snippets/structured-output-bedrock)

### Performance & Cold Starts
- [AWS Lambda Still Matters in 2026 - Danilo Falcão](https://falcao.org/posts/aws-lambda-still-matters/)
- [Serverless Architecture Performance Optimization 2026](https://www.hostmycode.com/blog/serverless-architecture-performance-optimization-lambda-cold-starts-function-sizing-edge-computing-strategies-2026)
- [Benchmarking serverless cold start times for AWS Lambda 2026 runtimes](https://www.johal.in/benchmarking-serverless-cold-start-times-for-aws-lambda-2026-runtimes)

### Authorization Issues
- [Permission denied - allow.authenticated() - GitHub Issue #13431](https://github.com/aws-amplify/amplify-js/issues/13431)
- [Cannot setup Storage access permission for Owner if user is in a Group - GitHub Issue #1771](https://github.com/aws-amplify/amplify-backend/issues/1771)

---

*Pitfalls research for: Bridge (AWS Amplify Gen 2 + Bedrock AI integration)*
*Researched: 2026-11-03*
*Next: Review before roadmap creation to inform phase structure and success criteria*
