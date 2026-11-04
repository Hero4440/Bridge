# Stack Research

**Domain:** AWS Amplify Gen 2 backend integration for existing React app
**Researched:** 2026-11-03
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| AWS Amplify Gen 2 | Latest (6.20.0+) | Full-stack framework | Code-first TypeScript backend definition, native AWS service integration, replaces Gen 1's CLI-based approach. Gen 1 EOL May 2027. |
| aws-amplify (client) | 6.20.0+ | React client library | Official client with type-safe data operations, TanStack React Query integration, real-time subscriptions |
| Amazon Cognito | — | Authentication | Managed user pools with email/password, no role/group complexity needed, integrates natively with AppSync authorization |
| AWS AppSync | — | GraphQL API + Real-time | Managed GraphQL with WebSocket subscriptions for live chat, automatic connection management, flexible authorization |
| Amazon DynamoDB | — | NoSQL persistence | Serverless, auto-scaling, per-item authorization via owner/participant patterns, TTL for ephemeral data |
| AWS Lambda | Node.js 20+ | Serverless functions | TypeScript business logic, custom queries/mutations, AI endpoints with Bedrock access via IAM |
| Amazon Bedrock | — | AI/ML (Claude) | Managed LLM service, Converse API with native structured outputs (GA Feb 2026), IAM-based access (no API keys) |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query | Latest | Data fetching/caching | Required for Amplify Gen 2 data operations (useQuery, useMutation) |
| @aws-sdk/client-bedrock-runtime | Latest | Bedrock API client | Lambda functions calling Bedrock Converse API |
| zod | Latest | Runtime validation | Lambda input validation, Bedrock structured output schema |
| @aws-amplify/backend | Latest | Backend definition helpers | `defineAuth`, `defineData`, `defineFunction`, `secret()` |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| npx ampx sandbox | Personal cloud sandbox | Isolated dev environment per developer, auto-deploys on file save |
| npx ampx pipeline-deploy | Production deployment | Branch-based deployment via Amplify Hosting |
| TypeScript (strict) | Type safety | Required for Gen 2 backend definitions in `amplify/` directory |
| AWS CDK | Infrastructure overrides | Override Amplify-generated resources (TTL, PITR, IAM policies) |

## Installation

```bash
# Core (client-side)
npm install aws-amplify@latest @tanstack/react-query

# Backend dependencies (TypeScript, already in amplify/ folder)
npm install --save-dev @aws-amplify/backend typescript

# Lambda function dependencies (per function)
npm install @aws-sdk/client-bedrock-runtime zod

# Dev tools (global or npx)
npm install -D @aws-amplify/cli-core
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Amplify Gen 2 | Amplify Gen 1 | Never for new projects (EOL May 2027). Gen 1 uses CLI, CloudFormation, lacks type safety. |
| Amplify Gen 2 | Firebase | Team already in AWS ecosystem, need Bedrock integration, prefer relational auth patterns over Firebase's document model |
| Amplify Gen 2 | Supabase | Need AWS-native integration (Cognito/AppSync/DynamoDB), already using AWS, or require Bedrock AI |
| AppSync subscriptions | Polling/SSE | Never poll for real-time chat. AppSync WebSockets are managed and scale automatically. |
| Bedrock Converse API | Direct InvokeModel | Use Converse for multi-turn chat, structured outputs, tool calling. InvokeModel for legacy/raw access. |
| TanStack Query | Apollo Client | Gen 2 uses TanStack (better type inference). Apollo was Gen 1 pattern. |
| IAM for Bedrock | API keys | Always IAM for Lambda->Bedrock. No secrets in code/env. Lambda role gets bedrock:InvokeModel. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Amplify Gen 1 (`amplify` CLI) | Maintenance mode, EOL May 2027. No type safety, no code-first DX. | Amplify Gen 2 (`ampx` CLI) with TypeScript backend |
| DataStore | Not supported in Gen 2. Added complexity for sync. | AppSync GraphQL with TanStack Query |
| Amplify UI components (old) | Gen 1 pattern. Gen 2 uses headless approach. | Build custom components, use `generateClient` for data |
| `amplify push` | Gen 1 command. Doesn't exist in Gen 2. | `npx ampx sandbox` (dev) or `npx ampx pipeline-deploy` (prod) |
| Mocked backends | SKILL.md forbids mocks. Must use real AWS services. | Amplify sandbox (isolated, real AWS resources per dev) |
| Forced tool calling for structured output | Pre-Feb 2026 workaround for Bedrock. | Native `outputConfig.textFormat` in Converse API (GA Feb 2026) |
| `@ts-nocheck` | Defeats type safety. Bridge codebase rule. | Fix type errors, use strict TypeScript |

## Stack Patterns by Variant

**If integrating into existing React app (Bridge case):**
- Keep existing React/Vite setup
- Add `amplify/` directory at project root for backend definitions
- Install `aws-amplify` client library
- Configure Amplify in main entry (import `amplify_outputs.json`)
- Use `generateClient()` from `aws-amplify/data` for type-safe API calls
- Replace any existing auth with Cognito via `defineAuth`

**If starting from scratch:**
- Use `npm create amplify@latest` to scaffold project
- Choose React + Vite template
- Backend already configured in `amplify/` directory

**If monorepo:**
- Place `amplify/` at repo root
- Configure `amplify.yml` with monorepo paths
- Each app deploys with independent configuration
- Shared backend uses `npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID`

**If team has NO Gen 2 experience (Bridge case):**
- Start with sandbox: `npx ampx sandbox` (auto-deploys on save)
- Define one model in `amplify/data/resource.ts` with `allow.owner()`
- Add one Lambda function with custom query
- Test with `generateClient()` in React
- Read official docs for each AWS service pattern (don't guess)
- Expect learning curve (file-based conventions, CDK syntax), productivity improves after structure is understood

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| aws-amplify@6.20.0+ | Amplify Gen 2 backends | Gen 2 requires v6.2.0+. Not compatible with Gen 1 in same app. |
| Node.js 20+ | Lambda runtime | Use `nodejs20.x` for Lambda functions. Local dev needs Node 18+, npm 10+. |
| TypeScript (strict) | Amplify Gen 2 backend | Backend definitions in `amplify/` must be TypeScript. Frontend can be JS. |
| Bedrock Converse API | Claude 3.5 Sonnet v2 | Cross-region inference profiles need IAM for profile ARN + all region model ARNs. One-time use-case form in console for Anthropic models. |

## Amplify Gen 2 Setup Steps for Existing React App

### 1. Prerequisites
- Node.js 18+, npm 10+
- AWS account with SSO configured (`aws sso login`)
- AWS region with Bedrock access (check Bedrock model availability)
- Delete `package-lock.json`, `node_modules` before starting (prevents version conflicts)

### 2. Install Client Library
```bash
npm install aws-amplify@latest @tanstack/react-query
```

### 3. Create Backend Directory Structure
```bash
mkdir -p amplify/auth amplify/data amplify/functions
touch amplify/backend.ts amplify/data/resource.ts amplify/auth/resource.ts
```

### 4. Define Auth (`amplify/auth/resource.ts`)
```typescript
import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,  // Email/password login
  },
});
```

### 5. Define Data Model (`amplify/data/resource.ts`)
```typescript
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Message: a.model({
    content: a.string().required(),
    senderId: a.string().required(),
    recipientId: a.string().required(),
    timestamp: a.datetime(),
  })
  .authorization((allow) => [
    allow.owner(),  // Owner can CRUD their own messages
    allow.authenticated().to(['read']),  // Others can read
  ]),

  // Custom query for AI endpoint
  practiceTurn: a.query()
    .arguments({
      scenarioId: a.string().required(),
      message: a.string().required()
    })
    .returns(a.customType({ reply: a.string(), feedback: a.string() }))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function('practice')),
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({ schema });
```

### 6. Define Lambda Function (`amplify/functions/practice/resource.ts`)
```typescript
import { defineFunction } from '@aws-amplify/backend';

export const practice = defineFunction({
  name: 'practice',
  entry: './handler.ts',
  environment: {
    BEDROCK_MODEL_ID: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  },
});
```

### 7. Lambda Handler with Bedrock (`amplify/functions/practice/handler.ts`)
```typescript
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { z } from 'zod';

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

// Input validation
const InputSchema = z.object({
  scenarioId: z.string(),
  message: z.string().max(1000),
});

export const handler = async (event: any) => {
  // Validate input
  const input = InputSchema.parse(event.arguments);

  // Call Bedrock Converse API
  const response = await client.send(new ConverseCommand({
    modelId: process.env.BEDROCK_MODEL_ID,
    messages: [{ role: 'user', content: [{ text: input.message }] }],
    system: [{ text: 'You are Mo, a supportive AI buddy for practice conversations.' }],
    inferenceConfig: { maxTokens: 500, temperature: 0.7 },
  }));

  return {
    reply: response.output?.message?.content?.[0]?.text || 'Sorry, I couldn\'t respond.',
    feedback: 'Good start!',
  };
};
```

### 8. Wire Backend (`amplify/backend.ts`)
```typescript
import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { practice } from './functions/practice/resource';

const backend = defineBackend({ auth, data, practice });

// Grant Bedrock access to Lambda
backend.practice.resources.lambda.addToRolePolicy(new PolicyStatement({
  actions: ['bedrock:InvokeModel'],
  resources: ['arn:aws:bedrock:*::foundation-model/anthropic.claude-*'],
}));

// Enable PITR on DynamoDB tables (ponytail: CDK override for data resilience)
const dataResources = backend.data.resources;
for (const table of Object.values(dataResources.tables)) {
  table.pointInTimeRecovery = true;
}
```

### 9. Configure React Client (`src/main.tsx` or `src/index.tsx`)
```typescript
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

Amplify.configure(outputs);

const queryClient = new QueryClient();

// Wrap app with QueryClientProvider
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### 10. Use in React Components
```typescript
import { generateClient } from 'aws-amplify/data';
import { useMutation } from '@tanstack/react-query';
import type { Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();

function PracticeScreen() {
  const practiceMutation = useMutation({
    mutationFn: async ({ scenarioId, message }: { scenarioId: string; message: string }) => {
      const result = await client.queries.practiceTurn({ scenarioId, message });
      return result.data;
    },
  });

  const handleSubmit = () => {
    practiceMutation.mutate({ scenarioId: 'join-chat', message: 'Hi everyone!' });
  };

  return <div>{practiceMutation.data?.reply}</div>;
}
```

### 11. Start Sandbox
```bash
npx ampx sandbox
```
This deploys real Cognito, AppSync, DynamoDB, Lambda to an isolated personal environment. Changes auto-deploy on file save.

### 12. Production Deployment (Amplify Hosting)
Create `amplify.yml` at repo root:
```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - npm ci --cache .npm --prefer-offline
        - npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID
frontend:
  phases:
    preBuild:
      commands:
        - npm ci --cache .npm --prefer-offline
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - .npm/**/*
      - node_modules/**/*
```

Push to `main`, connect repo in Amplify Console, specify `amplify.yml` path.

## Integration Patterns for Existing React Code

### Authentication Migration
**Before (custom auth):**
```typescript
const [user, setUser] = useState(null);
login(email, password).then(setUser);
```

**After (Cognito):**
```typescript
import { signIn, signOut, getCurrentUser } from 'aws-amplify/auth';

// Login
await signIn({ username: email, password });

// Get current user
const user = await getCurrentUser();

// Logout
await signOut();
```

### Data Fetching Migration
**Before (REST API):**
```typescript
const [messages, setMessages] = useState([]);
useEffect(() => {
  fetch('/api/messages').then(r => r.json()).then(setMessages);
}, []);
```

**After (AppSync with TanStack Query):**
```typescript
import { generateClient } from 'aws-amplify/data';
import { useQuery } from '@tanstack/react-query';

const client = generateClient<Schema>();

const { data: messages } = useQuery({
  queryKey: ['messages'],
  queryFn: async () => {
    const result = await client.models.Message.list();
    return result.data;
  },
});
```

### Real-Time Subscriptions
**For live chat (AppSync WebSockets):**
```typescript
import { generateClient } from 'aws-amplify/data';

const client = generateClient<Schema>();

// Subscribe to new messages
useEffect(() => {
  const subscription = client.models.Message.onCreate().subscribe({
    next: (message) => {
      console.log('New message:', message);
      // Update UI
    },
  });

  return () => subscription.unsubscribe();
}, []);
```

### Environment-Specific Configuration
- **Sandbox:** Each dev runs `npx ampx sandbox`, gets personal stack named after their AWS user
- **Staging/Prod:** Branch-based deployment via Amplify Hosting
- **Secrets:** Never use `.env` for AWS secrets. Use `secret('NAME')` from `@aws-amplify/backend`, set with `npx ampx sandbox secret set NAME` (sandbox) or Amplify Console (prod)

### TTL Configuration (Ephemeral Data)
**For temporary practice runs or notifications:**
```typescript
// In data/resource.ts
PracticeRun: a.model({
  content: a.string(),
  expiresAt: a.integer(),  // Unix timestamp
})
.authorization((allow) => [allow.owner()])

// In backend.ts (CDK override)
const practiceRunTable = backend.data.resources.tables['PracticeRun'];
practiceRunTable.timeToLiveAttribute = 'expiresAt';
```

### Authorization Patterns for Bridge Use Cases

| Use Case | Pattern | Implementation |
|----------|---------|----------------|
| User owns reflections | `allow.owner()` | Reflection model: `.authorization((allow) => [allow.owner()])` |
| Circle members see messages | `allow.authenticated()` with custom Lambda | Custom query checks membership, uses `allow.resource(lambdaFn)` |
| Guardian sees only shared data | Custom Lambda with person-controlled permissions | Lambda reads `GuardianLink` permissions, filters response |
| DM participants see messages | Custom field-based auth | Message model with `participantIds[]`, custom rule checks array |

## Cost Guards (Required Before First Bedrock Call)

### 1. AWS Budgets
Set in AWS Console before first deployment:
```
Monthly budget: $50
Alerts: 50%, 80%, 100%
Email: all team members
```

### 2. Lambda Rate Limiting
```typescript
// In Lambda handler
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

async function checkRateLimit(userId: string): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const ttl = now + 3600; // 1 hour

  // Increment counter with TTL (ponytail: DynamoDB atomic counter for rate limit)
  const result = await dynamodb.send(new UpdateItemCommand({
    TableName: 'RateLimits',
    Key: { userId: { S: userId }, window: { N: String(now - (now % 3600)) } },
    UpdateExpression: 'ADD requestCount :inc SET expiresAt = :ttl',
    ExpressionAttributeValues: { ':inc': { N: '1' }, ':ttl': { N: String(ttl) } },
    ReturnValues: 'ALL_NEW',
  }));

  const count = parseInt(result.Attributes?.requestCount?.N || '0');
  return count <= 100; // 100 requests/hour per user
}
```

### 3. Bedrock Configuration
```typescript
// In Converse API call
inferenceConfig: {
  maxTokens: 500,        // Cap output tokens
  temperature: 0.7,
}

// Validate input length before calling
if (input.message.length > 1000) {
  throw new Error('Message too long');
}
```

### 4. Lambda Reserved Concurrency
```typescript
// In backend.ts
backend.practice.resources.lambda.reservedConcurrentExecutions = 10;
```

### 5. CloudWatch Alarms
```typescript
// In backend.ts (CDK)
import { Alarm } from 'aws-cdk-lib/aws-cloudwatch';

new Alarm(backend, 'PracticeLambdaErrors', {
  metric: backend.practice.resources.lambda.metricErrors(),
  threshold: 5,
  evaluationPeriods: 1,
  alarmDescription: 'Practice Lambda error rate',
});
```

## Current Limitations and Workarounds

| Limitation | Impact | Workaround | Status |
|------------|--------|----------|--------|
| No visual Studio UI | Gen 1 had Amplify Studio for data modeling | Write schema in TypeScript (steeper learning curve) | Permanent (Gen 2 is code-first by design) |
| No DataStore | Local-first sync library from Gen 1 | Use AppSync subscriptions + TanStack Query caching | Permanent (not planned for Gen 2) |
| Migration from Gen 1 is manual | No automated migration tool | Follow official migration guide, rebuild backend in Gen 2 | Tooling in development (not GA yet) |
| 220 MB SSR limit on Amplify Hosting | Next.js projects can exceed limit | Use SPA (Vite/CRA), optimize bundle, or self-host | Known issue, optimize builds |
| Bedrock throttling | High traffic can hit API limits | Implement rate limiting, use reserved concurrency, fallback responses | Configure cost guards |

## Common Pitfalls and Prevention

### Critical Pitfalls (Cause Rewrites)

#### Pitfall 1: Mixing Gen 1 and Gen 2
**What goes wrong:** Gen 1 CLI (`amplify`) and Gen 2 (`ampx`) cannot coexist in the same project.
**Why it happens:** Attempting to use `amplify push` in Gen 2 project or installing Gen 1 dependencies.
**Consequences:** Conflicting CloudFormation stacks, data loss, deployment failures.
**Prevention:** Delete all Gen 1 artifacts (`amplify/` with team-provider-info.json, `.amplifyrc`). Use only `npx ampx` commands.
**Detection:** Error: "Amplify project not initialized" when running `amplify push`.

#### Pitfall 2: Incorrect Authorization Rules
**What goes wrong:** Frontend can't access data, or wrong users see private data.
**Why it happens:** Amplify uses deny-by-default. Missing `allow.authenticated()` or `allow.owner()` blocks all access.
**Consequences:** "Unauthorized" errors, data leaks, security vulnerabilities.
**Prevention:** Test with two accounts (owner and non-owner). Explicitly define `allow.owner()` for private data, `allow.authenticated()` for shared, and `allow.resource(fn)` for custom rules.
**Detection:** GraphQL errors: "Not Authorized to access X on type Y".

#### Pitfall 3: Missing Lambda IAM Permissions
**What goes wrong:** Lambda can invoke Bedrock locally (using dev credentials) but fails in prod.
**Why it happens:** Forgot to add `bedrock:InvokeModel` policy to Lambda role in `backend.ts`.
**Consequences:** Production errors, 403 Forbidden from Bedrock.
**Prevention:** Always add IAM policies in `backend.ts` using `addToRolePolicy()`. Test in sandbox (uses real IAM).
**Detection:** Error: "User is not authorized to perform: bedrock:InvokeModel".

### Moderate Pitfalls

#### Pitfall 1: Schema Changes Break Existing Data
**What goes wrong:** Adding required fields to models with existing data causes deployment failure.
**Prevention:** Make new fields optional (`a.string()` not `.required()`), or provide default value.

#### Pitfall 2: Stale TypeScript Types
**What goes wrong:** Frontend types don't match backend schema after changes.
**Prevention:** Sandbox auto-regenerates `amplify_outputs.json`. Restart dev server to reload types. For production, regenerate with `npx ampx generate outputs --branch main --app-id <id>`.

#### Pitfall 3: Secrets in Code
**What goes wrong:** API keys committed to Git, exposed in client bundle.
**Prevention:** Use `secret('NAME')` from `@aws-amplify/backend` for backend secrets, never `.env`. Set with `npx ampx sandbox secret set NAME`. Pre-commit hook checks for keys (Bridge has `bridge-hooks.mjs`).

### Minor Pitfalls

#### Pitfall 1: Node Version Mismatch
**What goes wrong:** `npm ci` fails in Amplify Hosting build.
**Prevention:** Set Node version in `amplify.yml` or `.nvmrc`. Use same version locally (Node 18+).

#### Pitfall 2: Large Build Artifacts
**What goes wrong:** Deployment fails due to 220 MB SSR limit.
**Prevention:** Use SPA (Vite), tree-shake unused imports, lazy-load routes.

#### Pitfall 3: Polling Instead of Subscriptions
**What goes wrong:** High API costs, stale data, poor UX.
**Prevention:** Always use AppSync subscriptions for real-time features (chat, notifications). Gen 2 client handles WebSocket reconnection automatically.

## Sources

### High Confidence (Official Docs, Official Releases)
- [Amplify Gen 2 Quickstart](https://docs.amplify.aws/react/start/quickstart/) — Gen 2 setup, backend definition patterns
- [Amplify Gen 2 Manual Installation](https://docs.amplify.aws/react/start/manual-installation/) — Installing aws-amplify in existing React apps
- [Amplify Gen 2 Sandbox Environments](https://docs.amplify.aws/react/deploy-and-host/sandbox-environments/setup/) — Personal cloud sandbox workflow
- [Custom Queries and Mutations](https://docs.amplify.aws/react/build-a-backend/data/custom-business-logic/) — Lambda-backed custom operations
- [Custom Data Access Using Lambda](https://docs.amplify.aws/react/build-a-backend/data/customize-authz/custom-data-access-patterns/) — Custom authorization with Lambda
- [Per-User/Per-Owner Data Access](https://docs.amplify.aws/react/build-a-backend/data/customize-authz/per-user-per-owner-data-access/) — Owner authorization patterns
- [DynamoDB TTL and Point-in-Time Recovery](https://docs.amplify.aws/react/build-a-backend/add-aws-services/deletion-backup-resources/) — CDK overrides for data resilience
- [Override Amplify-Generated Resources](https://docs.amplify.aws/react/build-a-backend/data/override-resources/) — CDK customization patterns
- [AppSync Real-Time Subscriptions](https://docs.aws.amazon.com/appsync/latest/devguide/aws-appsync-real-time-data.html) — WebSocket subscriptions for live data
- [AWS Amplify Gen 2 GA Announcement (May 2024)](https://aws.amazon.com/about-aws/whats-new/2024/05/aws-amplify-gen-2-available/) — Gen 2 features and TypeScript-first approach
- [Structured Outputs on Amazon Bedrock](https://aws.amazon.com/blogs/machine-learning/structured-outputs-on-amazon-bedrock-schema-compliant-ai-responses/) — Native structured outputs via `outputConfig.textFormat` (GA Feb 2026)
- [AWS Amplify Feature Parity Matrix](https://docs.amplify.aws/react/start/migrate-to-gen2/feature-matrix/) — Gen 1 vs Gen 2 feature comparison
- [aws-amplify npm package](https://www.npmjs.com/package/aws-amplify) — Current version 6.20.0, Node 18+ requirement

### Medium Confidence (Recent Articles, Verified Multi-Source)
- [How to Build a Full-Stack App with Amplify Gen 2](https://oneuptime.com/blog/post/2026-02-12-build-a-full-stack-app-with-amplify-gen-2/view) (Feb 2026) — Gen 2 setup patterns, TanStack Query integration
- [How to Migrate from Amplify Gen 1 to Gen 2](https://oneuptime.com/blog/post/2026-02-12-migrate-from-amplify-gen-1-to-gen-2/view) (Feb 2026) — Migration challenges, Gen 1 EOL May 2027
- [How to Use Amplify API (GraphQL) with AppSync](https://oneuptime.com/blog/post/2026-02-12-amplify-api-graphql-appsync/view) (Feb 2026) — AppSync WebSocket subscriptions, authorization
- [How to Use Amplify Gen 2 for Full-Stack Development](https://oneuptime.com/blog/post/2026-02-12-amplify-gen2-full-stack-development/view) (Feb 2026) — Sandbox workflow, defineAuth/defineData patterns
- [What We Learned from AWS Amplify Gen 2: Speed and Scalability](https://www.raftlabs.com/blog/aws-amplify-gen-2-in-action/) (2026) — Real-world Gen 2 lessons, pitfalls
- [Create a Virtual Assistant Using Amplify Gen 2 and AWS Bedrock](https://cevo.com.au/post/create-a-virtual-assistant-using-amplify-gen-2-and-aws-bedrock-2/) — Bedrock Lambda integration with IAM policies
- [Creating a Generative AI Travel Assistant with Bedrock and Amplify](https://aws.amazon.com/blogs/mobile/creating-a-generative-ai-travel-assistant-app-with-amazon-bedrock-and-aws-amplify/) — Bedrock Converse API patterns with Amplify Gen 2
- [Running AWS Amplify Gen 2 Apps Locally with LocalStack](https://blog.localstack.cloud/running-amplify-gen2-apps-locally-with-localstack/) — Sandbox architecture, isolated dev environments
- [GitHub: LocalStack Amplify Gen 2 Sample](https://github.com/localstack-samples/sample-amplify-gen2-todo-app) — Todo app with Cognito, AppSync, DynamoDB

---
*Stack research for: AWS Amplify Gen 2 backend integration for existing React app*
*Researched: 2026-11-03*
