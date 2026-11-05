// Preserve legacy DM history in participant-only storage and align old slug-based circle references.
// Run with maintainer AWS credentials: npx tsx scripts/migrate-community.ts --api-id <sandbox-id> --apply
// Without --apply, this reports counts only. Message bodies are never logged.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  TransactWriteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
const apiId = process.argv[process.argv.indexOf("--api-id") + 1];
if (!/^[a-z0-9]{26}$/.test(apiId ?? ""))
  throw new Error("Pass the development AppSync API id with --api-id");
const apply = process.argv.includes("--apply");
const db = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: "us-east-1" }),
);
const table = (model: string) => `${model}-${apiId}-NONE`;
async function scan(name: string) {
  const rows: Record<string, unknown>[] = [];
  let token: Record<string, unknown> | undefined;
  do {
    const page = await db.send(
      new ScanCommand({ TableName: table(name), ExclusiveStartKey: token }),
    );
    rows.push(...(page.Items ?? []));
    token = page.LastEvaluatedKey;
  } while (token);
  return rows;
}
const groups = await scan("Group");
const slugs = new Map(
  groups.filter((g) => g.slug).map((g) => [String(g.slug), String(g.id)]),
);
const messages = await scan("Message");
let moved = 0,
  skipped = 0,
  aligned = 0;
for (const row of messages) {
  const groupId = String(row.groupId ?? "");
  if (groupId.startsWith("dm#")) {
    let participants = groupId.split("#").slice(1);
    if (participants.length !== 2 || participants.some((p) => !p)) {
      skipped++;
      participants = ["legacy-quarantine"];
    }
    const id = `legacy#${row.id}`;
    const now = new Date().toISOString();
    if (apply)
      await db.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Put: {
                TableName: table("DirectMessage"),
                Item: {
                  id,
                  threadId: `dm#${participants.sort().join("#")}`,
                  participants,
                  senderId: row.senderId,
                  content: row.content,
                  timestamp: row.timestamp ?? row.createdAt ?? now,
                  createdAtMs:
                    row.createdAtMs ?? Date.parse(String(row.createdAt ?? now)),
                  createdAt: row.createdAt ?? now,
                  updatedAt: now,
                  __typename: "DirectMessage",
                },
                ConditionExpression: "attribute_not_exists(id)",
              },
            },
            {
              Delete: {
                TableName: table("Message"),
                Key: { id: row.id },
                ConditionExpression: "groupId=:group",
                ExpressionAttributeValues: { ":group": groupId },
              },
            },
          ],
        }),
      );
    moved++;
  } else if (slugs.has(groupId) && slugs.get(groupId) !== groupId) {
    if (apply)
      await db.send(
        new UpdateCommand({
          TableName: table("Message"),
          Key: { id: row.id },
          UpdateExpression: "SET groupId=:group",
          ExpressionAttributeValues: { ":group": slugs.get(groupId) },
        }),
      );
    aligned++;
  }
}
for (const event of await scan("Event")) {
  const id = String(event.circleId ?? "");
  if (slugs.has(id) && slugs.get(id) !== id) {
    if (apply)
      await db.send(
        new UpdateCommand({
          TableName: table("Event"),
          Key: { id: event.id },
          UpdateExpression: "SET circleId=:group",
          ExpressionAttributeValues: { ":group": slugs.get(id) },
        }),
      );
    aligned++;
  }
}
console.log(
  JSON.stringify({
    applied: apply,
    privateDmHistory: moved,
    unrecognizedLegacyThreads: skipped,
    alignedCircleReferences: aligned,
  }),
);
if (skipped)
  console.log(
    "Unrecognized legacy threads were preserved in restricted quarantine for maintainer review.",
  );
