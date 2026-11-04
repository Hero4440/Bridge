// app/amplify/backend.ts
// Composes Bridge's Amplify Gen 2 backend (auth + data + pre-sign-up trigger),
// sets a 30-day refresh token (D-05/AUTH-03) and a $50/month cost budget (D-06).
import { defineBackend } from '@aws-amplify/backend';
import { CfnBudget } from 'aws-cdk-lib/aws-budgets';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { preSignUp } from './functions/pre-sign-up/resource';

const backend = defineBackend({ auth, data, preSignUp });

// D-05 / AUTH-03: 30-day refresh token so sessions survive a browser refresh.
// NOTE [confirm on first deploy]: the cfnResources path is from RESEARCH Pattern 2;
// if the installed Amplify version differs, adjust to the documented CDK override.
const { cfnUserPoolClient } = backend.auth.resources.cfnResources;
cfnUserPoolClient.refreshTokenValidity = 30;
cfnUserPoolClient.tokenValidityUnits = { refreshToken: 'days' };

// D-06: $50/month cost guard with email alerts at 50/80/100% ACTUAL spend.
// Must exist before Phase 2's first Bedrock call. The address below is a plain
// team distribution email — config, not a secret, not participant data. Replace
// the placeholder with the real team alias before deploy.
const budgetStack = backend.createStack('BudgetStack');
const TEAM_ALERT_EMAIL = 'REPLACE_WITH_TEAM_ALIAS@example.com';

new CfnBudget(budgetStack, 'BridgeMonthlyBudget', {
  budget: {
    budgetName: 'bridge-monthly',
    budgetType: 'COST',
    timeUnit: 'MONTHLY',
    budgetLimit: { amount: 50, unit: 'USD' },
  },
  notificationsWithSubscribers: [50, 80, 100].map((threshold) => ({
    notification: {
      notificationType: 'ACTUAL',
      comparisonOperator: 'GREATER_THAN',
      threshold,
      thresholdType: 'PERCENTAGE',
    },
    subscribers: [{ subscriptionType: 'EMAIL', address: TEAM_ALERT_EMAIL }],
  })),
});
