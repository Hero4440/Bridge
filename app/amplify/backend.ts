// app/amplify/backend.ts
// Composes Bridge's Amplify Gen 2 backend: auth (+30-day refresh token, D-05), the data
// schema, the pre-sign-up trigger, and the four Phase-2 AI Lambdas. Adds the $50 budget
// (D-06), least-privilege Bedrock IAM with EXACT inference-profile + foundation-model ARNs
// (LAMBDA-05, never "*"), a DynamoDB rate-limit table (LAMBDA-08), and reserved concurrency.
import { createHash } from "node:crypto";
import { Stack } from "aws-cdk-lib";
import { defineBackend } from "@aws-amplify/backend";
import { CfnBudget } from "aws-cdk-lib/aws-budgets";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { storage } from "./storage/resource";
import { preSignUp } from "./functions/pre-sign-up/resource";
import { classify } from "./functions/classify/resource";
import { practice } from "./functions/practice/resource";
import { tone } from "./functions/tone/resource";
import { preview } from "./functions/preview/resource";
import { reflectReply } from "./functions/reflectReply/resource";
import { dailyTopic } from "./functions/dailyTopic/resource";
import { community } from "./functions/community/resource";
import { eventReminders } from "./functions/eventReminders/resource";
import { sendDm } from "./functions/sendDm/resource";
import { respondToRequest } from "./functions/respondToRequest/resource";
import { sendHelpAlert } from "./functions/sendHelpAlert/resource";
import { moChat } from "./functions/moChat/resource";

const backend = defineBackend({
  community,
  eventReminders,
  auth,
  data,
  storage,
  preSignUp,
  classify,
  practice,
  tone,
  preview,
  reflectReply,
  dailyTopic,
  sendDm,
  respondToRequest,
  sendHelpAlert,
  moChat,
});

// Private daily state and intentions can be restored after an accidental write.
// Amplify's custom table manager exposes wrappers rather than CfnTable objects.
for (const name of [
  "CheckIn",
  "WeeklyGoal",
  "CirclePresence",
  "DirectMessage",
  "CircleMembership",
  "EventPrep",
  "ThreadState",
]) {
  backend.data.resources.cfnResources.amplifyDynamoDbTables[
    name
  ].pointInTimeRecoveryEnabled = true;
}
backend.data.resources.cfnResources.amplifyDynamoDbTables.CirclePresence.timeToLiveAttribute =
  {
    attributeName: "expiresAt",
    enabled: true,
  };

// D-05 / AUTH-03: 30-day refresh token so sessions survive a browser refresh.
const { cfnUserPoolClient } = backend.auth.resources.cfnResources;
cfnUserPoolClient.refreshTokenValidity = 30;
cfnUserPoolClient.tokenValidityUnits = { refreshToken: "days" };

// Keep signup approachable: eight characters are still required, but users do not
// need to invent uppercase letters or numbers just to make an account.
backend.auth.resources.cfnResources.cfnUserPool.policies = {
  passwordPolicy: {
    minimumLength: 8,
    requireLowercase: false,
    requireUppercase: false,
    requireNumbers: false,
    requireSymbols: false,
  },
};

// D-06: $50/month cost guard with email alerts at 50/80/100% ACTUAL spend.
// Plain team email — config, not a secret. (Public repo: swap for a shared alias if preferred.)
const budgetStack = backend.createStack("BudgetStack");
const authStack = Stack.of(backend.auth.resources.userPool);
const rootStack = authStack.nestedStackParent ?? authStack;
// Preserve the original account guard and give independent sandboxes unique budget resources.
const budgetName = rootStack.stackName.includes("-hero4440-")
  ? "bridge-monthly"
  : `bridge-monthly-${createHash("sha256").update(rootStack.stackName).digest("hex").slice(0, 10)}`;
const TEAM_ALERT_EMAIL = "tejasshah4440@gmail.com";

new CfnBudget(budgetStack, "BridgeMonthlyBudget", {
  budget: {
    budgetName,
    budgetType: "COST",
    timeUnit: "MONTHLY",
    budgetLimit: { amount: 50, unit: "USD" },
  },
  notificationsWithSubscribers: [50, 80, 100].map((threshold) => ({
    notification: {
      notificationType: "ACTUAL",
      comparisonOperator: "GREATER_THAN",
      threshold,
      thresholdType: "PERCENTAGE",
    },
    subscribers: [{ subscriptionType: "EMAIL", address: TEAM_ALERT_EMAIL }],
  })),
});

// LAMBDA-05: least-privilege Bedrock invocation. EXACT inference-profile ARNs + the routed
// foundation-model ARNs in every region the `us.` profiles reach (confirmed via
// get-inference-profile). NEVER "*" — avoids the cross-region AccessDenied pitfall.
const BEDROCK_ARNS = [
  "arn:aws:bedrock:us-east-1:429367298232:inference-profile/us.anthropic.claude-haiku-4-5-20251001-v1:0",
  "arn:aws:bedrock:us-east-1:429367298232:inference-profile/us.anthropic.claude-sonnet-4-5-20250929-v1:0",
  "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0",
  "arn:aws:bedrock:us-east-2::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0",
  "arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0",
  "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-sonnet-4-5-20250929-v1:0",
  "arn:aws:bedrock:us-east-2::foundation-model/anthropic.claude-sonnet-4-5-20250929-v1:0",
  "arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-sonnet-4-5-20250929-v1:0",
];
// sendDm calls classify() (Bedrock); respondToRequest + sendHelpAlert are Data-only (not added here).
const aiFunctions = [
  backend.classify,
  backend.practice,
  backend.tone,
  backend.preview,
  backend.reflectReply,
  backend.dailyTopic,
  backend.sendDm,
  backend.community,
  backend.moChat,
];
for (const fn of aiFunctions) {
  fn.resources.lambda.addToRolePolicy(
    new PolicyStatement({
      actions: ["bedrock:InvokeModel"],
      resources: BEDROCK_ARNS,
    }),
  );
}
// NOTE: reserved concurrency (cost guard) is deferred — this account's Lambda concurrency
// limit is 10, so reserving any per-function amount is rejected. Cost is guarded by the $50
// budget + per-user rate limit + maxTokens≤500. Re-add once the concurrency quota is raised.

// LAMBDA-08: per-user rate-limit counter table (TTL). Granted to the three rate-limited
// functions (classify is never rate-limited); RATE_LIMIT_TABLE env binds shared/rateLimit.ts.
const aiStack = backend.createStack("AiStack");
const rateLimitTable = new Table(aiStack, "RateLimit", {
  partitionKey: { name: "pk", type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
  timeToLiveAttribute: "ttl",
});
for (const fn of [backend.practice, backend.tone, backend.preview, backend.community, backend.sendDm, backend.moChat]) {
  rateLimitTable.grantWriteData(fn.resources.lambda);
  fn.addEnvironment("RATE_LIMIT_TABLE", rateLimitTable.tableName);
}

// Capacity updates use a transaction over these exact tables; no wildcard data access.
for (const name of ["Event", "RSVP"] as const) {
  const table = backend.data.resources.tables[name];
  table.grantReadWriteData(backend.community.resources.lambda);
  backend.community.addEnvironment(
    name === "Event" ? "EVENT_TABLE" : "RSVP_TABLE",
    table.tableName,
  );
}
