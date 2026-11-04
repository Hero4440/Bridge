# Technology Stack

**Analysis Date:** 2026-11-03

## Languages

**Primary:**
- TypeScript - React components, Lambda functions, type safety with strict mode
- JavaScript - Hook scripts, seed data generation
- CSS - Styling with CSS variables for theming, animations (Outfit font)

**Secondary:**
- Python - Bias probe script (`scripts/bias_probe.py`)

## Runtime

**Environment:**
- Node.js - Backend functions (Lambda), scripts, hooks
- Browser (PWA) - React app runs on iOS, Android and desktop browsers

**Package Manager:**
- npm - Primary package manager
- Lockfile: present (implied by standard Node.js project)

## Frameworks

**Core:**
- React 18+ - UI framework via Vite
- Vite - Development server and build tool
- Amplify Gen 2 (AWS) - Backend infrastructure as code

**Authentication:**
- AWS Cognito - User sign-up, login, session management

**Data & Real-time:**
- AWS AppSync - GraphQL API, live subscriptions for chat
- AWS DynamoDB - Primary database, no ORMs (accessed via Amplify Data client)

**AI/ML:**
- Amazon Bedrock - Claude model inference via IAM role
- AWS Lambda (TypeScript) - API endpoints wrapping Bedrock calls

**Deployment:**
- AWS Amplify Hosting - Push to GitHub triggers deploy, CloudFront CDN
- GitHub - Source control, CI/CD trigger

## Key Dependencies

**Critical:**
- React - UI rendering
- Bedrock Runtime SDK (`@aws-sdk/client-bedrock-runtime`) - Model inference API
- Amplify backend (`@aws-amplify/backend`) - IaC and data client
- Cognito - Authentication (via Amplify)
- AppSync - GraphQL and live subscriptions (via Amplify Data)
- DynamoDB - Data persistence (via AppSync)

**Infrastructure:**
- AWS Lambda - Compute for AI endpoints (/practice, /preview, /tone, classify)
- AWS IAM - Least-privilege role permissions for Lambdas
- EventBridge - Scheduled tasks (stretch: quiet check-ins)
- CloudWatch - Logs and error tracking
- AWS Budgets - Cost alerts
- Web Push (stretch) - Browser push notifications via VAPID

**Utilities:**
- zod - Input validation on Lambda functions
- Node.js crypto (`node:crypto`) - Token redaction in hooks

## Configuration

**Environment:**
- Runtime: Node.js (version not specified in codebase; check `.nvmrc` if present)
- AWS Region: TBD (recorded in `amplify/shared/config.ts` once chosen)
- Bedrock Region: chosen region (same as all other AWS services per SKILL.md 1.4)
- Bedrock Model: small Claude model (exact ID per `aws bedrock list-inference-profiles`)

**Build:**
- Vite configuration in figma-make (see `figma-make/` for Make-specific config)
- TypeScript strict mode enabled
- No mock users or data; all data flows through real AWS services

**Secrets:**
- AWS credentials: via SSO login (`aws sso login`), never in files or env vars
- Non-AWS secrets: `secret('NAME')` from `@aws-amplify/backend`, set via `npx ampx sandbox secret set` locally
- All other secrets: AWS Secrets Manager or Amplify Secrets

## Platform Requirements

**Development:**
- Node.js runtime
- `aws` CLI (v2+)
- AWS SSO configured with credential provider
- `npx` (comes with npm)
- Git for version control
- Mac, Linux or Windows (platform independent for Node.js work)

**Production:**
- AWS account (Amplify Hosting, Cognito, AppSync, DynamoDB, Lambda, Bedrock, EventBridge, CloudWatch, Budgets)
- Bedrock access enabled in console (one-time setup)
- IAM roles least-privilege per function
- GitHub repository (code trigger for Amplify deploy)
- Amplify app configured with environment branch (`main` for production)

## Build & Deploy

**Local Development:**
```bash
npx ampx sandbox                    # Start local sandbox
npx ampx sandbox secret set NAME    # Set non-AWS secrets
npm run dev                         # Run Vite dev server (figma-make or main project)
```

**Production Deploy:**
- Push to GitHub `main` branch
- Amplify Hosting webhook triggers build via `amplify.yml`
- Build command: `npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID`
- Deployed on CloudFront CDN

**Type Checking:**
```bash
npx tsc --noEmit    # Before every commit
```

## AI Models

**Bedrock Claude:**
- Inference API: Converse API (`@aws-sdk/client-bedrock-runtime`)
- Model: small Claude (exact ID from `aws bedrock list-inference-profiles`)
- Access: Lambda IAM role with least-privilege ARNs
- No API key in code; IAM role handles auth
- Timeout handling: SDK retries, then fallback to scripted response
- Max tokens: capped per endpoint to control cost
- Temperature: low for deterministic output

## Testing (Infrastructure)

**Unit Tests:** Not explicitly configured in current codebase; check if Jest/Vitest config added later
**Integration Tests:** Lambda functions tested with real DynamoDB and Cognito in sandbox
**E2E Tests:** Manual testing against sandbox before pushing `main`

---

*Stack analysis: 2026-11-03*
