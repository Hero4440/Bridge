// Verify real GraphQL argument shapes without importing a configured Lambda handler.
import { it, expect } from "vitest";
import { parseCommunityInput } from "../../amplify/functions/community/input";
it("accepts block and RSVP calls with AppSync null optional arguments", () => {
  expect(
    parseCommunityInput({
      action: "block",
      targetId: "person-1",
      text: null,
      status: null,
      clientMessageId: null,
    }).success,
  ).toBe(true);
  expect(
    parseCommunityInput({
      action: "rsvp",
      targetId: "event-1",
      status: "going",
      text: null,
      clientMessageId: null,
    }).success,
  ).toBe(true);
});
it("rejects unknown actions, invalid RSVP statuses and oversized messages", () => {
  expect(
    parseCommunityInput({ action: "forge", targetId: "person" }).success,
  ).toBe(false);
  expect(
    parseCommunityInput({ action: "rsvp", targetId: "event", status: "admin" })
      .success,
  ).toBe(false);
  expect(
    parseCommunityInput({
      action: "send-circle",
      targetId: "group",
      text: "x".repeat(2001),
    }).success,
  ).toBe(false);
});
