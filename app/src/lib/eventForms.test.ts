// Validate the user's event decisions and exported calendar behavior, including overlap boundaries.
import { describe, it, expect } from "vitest";
import { eventFormSchema, overlaps, calendarText } from "./eventForms";
const valid = {
  what: "Small group chat",
  date: "2099-01-02",
  time: "18:00",
  durationMinutes: 60,
  format: "inPerson",
  venue: "Community room",
  whereText: "",
  joinUrl: "",
  comfortSound: "Quiet",
  comfortLighting: "Soft",
  comfortSize: 4,
  exitPlan: "",
  circleId: "",
  reminder: "oneHour",
  tellTrustedPerson: false,
};
describe("event setup", () => {
  it("requires a real meeting place or a secure voice/video link", () => {
    expect(eventFormSchema.safeParse(valid).success).toBe(true);
    expect(eventFormSchema.safeParse({ ...valid, venue: "" }).success).toBe(
      false,
    );
    expect(
      eventFormSchema.safeParse({
        ...valid,
        format: "video",
        joinUrl: "http://example.com",
      }).success,
    ).toBe(false);
    expect(
      eventFormSchema.safeParse({
        ...valid,
        format: "video",
        joinUrl: "https://example.com/meeting",
      }).success,
    ).toBe(true);
  });
  it("rejects past start times, empty names, and invalid capacities", () => {
    expect(
      eventFormSchema.safeParse({ ...valid, date: "2000-01-01" }).success,
    ).toBe(false);
    expect(eventFormSchema.safeParse({ ...valid, what: " " }).success).toBe(
      false,
    );
    expect(
      eventFormSchema.safeParse({ ...valid, comfortSize: 0 }).success,
    ).toBe(false);
  });
  it("detects overlapping plans but allows back-to-back events", () => {
    const a = { whenAt: "2099-01-02T18:00:00Z", durationMinutes: 60 };
    expect(
      overlaps(a, { whenAt: "2099-01-02T18:30:00Z", durationMinutes: 60 }),
    ).toBe(true);
    expect(
      overlaps(a, { whenAt: "2099-01-02T19:00:00Z", durationMinutes: 60 }),
    ).toBe(false);
  });
});
it("exports the correct calendar interval and escapes user text", () => {
  const text = calendarText({
    id: "event-1",
    what: "Chat, play; relax\nBring snacks",
    whenAt: "2099-01-02T18:00:00Z",
    durationMinutes: 30,
    venue: "Community room",
  });
  expect(text).toContain("DTSTART:20990102T180000Z\r\n");
  expect(text).toContain("DTEND:20990102T183000Z\r\n");
  expect(text).toContain("SUMMARY:Chat\\, play\\; relax\\nBring snacks");
});
