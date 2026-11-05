// AppSync may pass omitted optional arguments as null; normalize them before validating the action.
import { z } from "zod";
export const communityInput = z.object({
  action: z.enum([
    "send-circle",
    "block",
    "rsvp",
    "share-event",
    "invite-event",
  ]),
  targetId: z.string().min(1).max(200),
  text: z.string().trim().min(1).max(2000).optional(),
  status: z.enum(["going", "maybe", "cant"]).optional(),
  clientMessageId: z.string().min(1).max(100).optional(),
});
export function parseCommunityInput(value: Record<string, unknown>) {
  return communityInput.safeParse(
    Object.fromEntries(Object.entries(value).filter(([, v]) => v !== null)),
  );
}
