// app/src/lib/safety.ts
// Safety actions: report a message, block a contact, and the "I need help" alert. Report/block are
// user-initiated owner writes (nothing is auto-blocked and warnings are private, §2.3); the help
// alert goes through the server mutation so it can notify the connected trusted person.
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from "aws-amplify/auth";
import { action } from "./community";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export async function reportMessage(
  targetId: string,
  reason: string,
  targetType: "message" | "user" = "message",
): Promise<void> {
  const { userId } = await getCurrentUser();
  const { errors } = await client.models.Report.create({
    reporterId: userId,
    targetType,
    targetId,
    reason,
    createdAt: new Date().toISOString(),
  });
  if (errors?.length)
    throw new Error(`reportMessage failed: ${JSON.stringify(errors)}`);
}

export async function blockContact(contactRowId: string): Promise<void> {
  const row = await client.models.Contact.get({ id: contactRowId });
  if (row.errors?.length || !row.data?.contactId)
    throw new Error("This contact is unavailable");
  await action({ action: "block", targetId: row.data.contactId });
}

export async function sendHelpAlert(
  note?: string,
): Promise<{ notified: number }> {
  const { data, errors } = await client.mutations.sendHelpAlert({ note });
  if (errors?.length)
    throw new Error(`sendHelpAlert failed: ${JSON.stringify(errors)}`);
  return { notified: data?.notified ?? 0 };
}
