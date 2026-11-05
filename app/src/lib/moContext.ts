import {
  feelingLabels,
  hardestLabels,
  upcomingLabels,
  type CheckInValues,
} from "./checkin";
import type { UserRecord } from "./profile";

export type MoContextMessage = {
  speaker: string;
  text: string;
};

const clean = (value: string, limit = 240) =>
  value.replace(/\s+/g, " ").trim().slice(0, limit);

export function moContext(
  profile: UserRecord,
  checkIn: CheckInValues,
  screen: string,
  messages: readonly MoContextMessage[] = [],
) {
  const interests = (profile.interests ?? []).filter(
    (interest): interest is string => !!interest,
  );
  const lines = [
    `Current screen: ${clean(screen, 40)}.`,
    `Person: ${clean(profile.firstName ?? "Bridge member", 60)}.`,
    interests.length ? `Interests: ${interests.slice(0, 6).map((item) => clean(item, 40)).join(", ")}.` : "",
    `Preferences: Mo help ${clean(profile.comfortMoHelp ?? "some", 20)}; ${profile.comfortPlainWords ? "plain words" : "friendly words"}; ${profile.comfortTextFirst === false ? "voice is okay" : "text first"}; ${profile.comfortCalmMode ? "calm mode on, preferring quieter and lower-pressure support" : "calm mode off"}.`,
    `This session's check-in: feeling ${feelingLabels[checkIn.feeling]}; coming up ${upcomingLabels[checkIn.upcoming]}; hardest part ${hardestLabels[checkIn.hardest]}.`,
  ].filter(Boolean);

  return withMoMessages(lines.join("\n"), messages);
}

export function withMoMessages(
  context: string,
  messages: readonly MoContextMessage[],
) {
  const recent = messages
    .slice(-3)
    .map(({ speaker, text }) => `${clean(speaker, 40)}: ${clean(text)}`)
    .filter((line) => !line.endsWith(": "));
  return `${context}${recent.length ? `\nRecent relevant messages:\n${recent.join("\n")}` : ""}`.slice(0, 1600);
}
