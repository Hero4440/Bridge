// User-entered event fields, local dates, overlap detection, and portable calendar downloads.
import { z } from "zod";
export const eventFormSchema = z
  .object({
    what: z.string().trim().min(1, "Name your event").max(120),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date"),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Choose a time"),
    durationMinutes: z.number().int().min(15).max(480),
    format: z.enum(["inPerson", "voice", "video", "text"]),
    venue: z.string().trim().max(200),
    whereText: z.string().trim().max(300),
    joinUrl: z.string().trim().max(1000),
    comfortSound: z.enum(["Quiet", "Soft music", "Loud music"]),
    comfortLighting: z.enum(["Soft", "Bright", "Dim"]),
    comfortSize: z.number().int().min(2).max(100),
    exitPlan: z.string().trim().max(300),
    circleId: z.string(),
    reminder: z.enum(["oneHour", "oneDay", "both"]),
    tellTrustedPerson: z.boolean(),
  })
  .superRefine((v, ctx) => {
    const date = new Date(`${v.date}T${v.time}`);
    if (!Number.isFinite(date.getTime()) || date.getTime() <= Date.now())
      ctx.addIssue({
        code: "custom",
        path: ["time"],
        message: "Choose a start time in the future",
      });
    if (v.format === "inPerson" && !v.venue)
      ctx.addIssue({
        code: "custom",
        path: ["venue"],
        message: "Enter the meeting place",
      });
    if (
      v.format !== "inPerson" &&
      v.format !== "text" &&
      !/^https:\/\//i.test(v.joinUrl)
    )
      ctx.addIssue({
        code: "custom",
        path: ["joinUrl"],
        message: "Add a secure meeting link for voice or video",
      });
    if (v.joinUrl) {
      try {
        const url = new URL(v.joinUrl);
        if (url.protocol !== "https:") throw new Error();
      } catch {
        ctx.addIssue({
          code: "custom",
          path: ["joinUrl"],
          message: "Use a valid https:// meeting link",
        });
      }
    }
  });
export type EventForm = z.infer<typeof eventFormSchema>;
export function eventEnd(event: {
  whenAt?: string | null;
  durationMinutes?: number | null;
}) {
  return event.whenAt
    ? Date.parse(event.whenAt) + (event.durationMinutes ?? 60) * 60000
    : 0;
}
export function overlaps(
  a: { whenAt?: string | null; durationMinutes?: number | null },
  b: { whenAt?: string | null; durationMinutes?: number | null },
) {
  return (
    !!a.whenAt &&
    !!b.whenAt &&
    Date.parse(a.whenAt) < eventEnd(b) &&
    Date.parse(b.whenAt) < eventEnd(a)
  );
}
const escapeCalendar = (text: string) =>
  text
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
export function calendarText(event: {
  id: string;
  what: string;
  whenAt?: string | null;
  durationMinutes?: number | null;
  venue?: string | null;
  whereText?: string | null;
  joinUrl?: string | null;
}) {
  if (!event.whenAt) throw new Error("The event needs a start time");
  const stamp = (date: Date) =>
    date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bridge//Events//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@bridge`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(new Date(event.whenAt))}`,
    `DTEND:${stamp(new Date(eventEnd(event)))}`,
    `SUMMARY:${escapeCalendar(event.what)}`,
    `LOCATION:${escapeCalendar(event.venue || event.whereText || event.joinUrl || "Bridge")}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
