// Tone explanations identify the actual word; they never silently change a person's draft.
import { it, expect } from "vitest";
import { toneWarning } from "./chat";
it("explains a matching harsh word and leaves neutral drafts unflagged", () => {
  expect(toneWarning("Whatever, that is STUPID")).toContain("whatever");
  expect(toneWarning("Please do not shut up everyone")).toContain("shut up");
  expect(toneWarning("I disagree, but I understand your point.")).toBe("");
});
