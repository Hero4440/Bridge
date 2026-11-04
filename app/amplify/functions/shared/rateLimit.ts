// app/amplify/functions/shared/rateLimit.ts
// Per-user rate limit (D-04 / LAMBDA-08): atomic DynamoDB counter, 100/hour, TTL ~2h.
// Crisis/safety callers skip this entirely (handled by the caller). Fails OPEN when the
// table isn't wired (local dev / unit tests) so nothing is blocked by accident.
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { REGION } from '../../shared/config';

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
const LIMIT = 100;

export const RATE_LIMIT_MESSAGE =
  "Mo needs a short break — you've done a lot this hour. Try again in a little while. 💛";

export async function checkRateLimit(userId: string): Promise<{ allowed: boolean; count: number }> {
  const table = process.env.RATE_LIMIT_TABLE;
  if (!table) return { allowed: true, count: 0 }; // fail-open when table not wired

  const hour = Math.floor(Date.now() / 3_600_000);
  const res = await doc.send(
    new UpdateCommand({
      TableName: table,
      Key: { pk: `${userId}#${hour}` },
      UpdateExpression: 'ADD #c :one SET #t = :ttl',
      ExpressionAttributeNames: { '#c': 'count', '#t': 'ttl' },
      ExpressionAttributeValues: { ':one': 1, ':ttl': (hour + 2) * 3600 },
      ReturnValues: 'ALL_NEW',
    }),
  );
  const count = Number(res.Attributes?.count ?? 0);
  return { allowed: count <= LIMIT, count };
}
