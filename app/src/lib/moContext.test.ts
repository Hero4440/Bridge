import { describe, expect, it } from "vitest";
import { moContext } from "./moContext";
import type { UserRecord } from "./profile";

const profile = {
  firstName: "Sam",
  lastName: "Private",
  email: "private@example.com",
  interests: ["Gaming", "Music"],
  comfortMoHelp: "lots",
  comfortPlainWords: true,
  comfortTextFirst: true,
  comfortCalmMode: false,
} as UserRecord;

describe("moContext", () => {
  it("includes useful preferences but excludes private profile fields", () => {
    const result = moContext(
      profile,
      { feeling: "okay", upcoming: "text", hardest: "tone" },
      "messages",
    );
    expect(result).toContain("Sam");
    expect(result).toContain("Gaming, Music");
    expect(result).toContain("feeling okay");
    expect(result).not.toContain("Private");
    expect(result).not.toContain("private@example.com");
  });

  it("keeps only three bounded recent messages", () => {
    const result = moContext(
      profile,
      { feeling: "ready", upcoming: "group", hardest: "start" },
      "circle",
      [
        { speaker: "A", text: "old" },
        { speaker: "B", text: "one" },
        { speaker: "You", text: "two" },
        { speaker: "B", text: "x".repeat(500) },
      ],
    );
    expect(result).not.toContain("A: old");
    expect(result).toContain("B: one");
    expect(result.length).toBeLessThanOrEqual(1600);
  });
});
