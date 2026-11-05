// Pure Make Circles view; real data and actions are supplied by the authenticated screen.
import { CircleGlyph, type CircleKind } from "../components/CircleGlyph";
import { OnboardingMo as Mo } from "../components/OnboardingMo";
import { PersonAvatar } from "../components/PersonAvatar";
import { CommunityHeader } from "../components/CommunityHeader";
import { CommunityNotice } from "../components/CommunityNotice";
import { circleStyle, type Group, type Member, type Membership } from "../lib/community";
import type { Schema } from "../../amplify/data/resource";
import "./Community.css";
export interface CircleListViewProps {
  onOpenDms: () => void;
  onRetry: () => void;
  onFilter: (filter: "for-you" | "all") => void;
  open: (id: string, reading?: boolean) => Promise<void>;
  online: boolean;
  error: string;
  feeling?: string;
  interests: (string | undefined)[];
  groupCount: number;
  filter: "for-you" | "all";
  notice: string;
  shown: Group[];
  busy: boolean;
  presences: Schema["CirclePresence"]["type"][];
  counts: Record<string, number>;
  members: Record<string, Member>;
  memberships: Membership[];
  topics: Record<string, string>;
}
export function CircleListView(v: CircleListViewProps) {
  return (
    <div className="community-page tab-screen">
      <CommunityHeader
        tab="circles"
        onCircles={() => {}}
        onMessages={() => v.onOpenDms()}
      />
      <CommunityNotice online={v.online} error={v.error} onRetry={v.onRetry} />
      <div className="tab-screen-content circles-content">
        <div className="circles-mo">
          <Mo size={52} />
          <span>
            {v.feeling === "over"
              ? "Feeling overwhelmed? Try “Just read”. No one expects you to post."
              : `You like ${v.interests.slice(0, 2).join(" and ") || "new things"}. Start there?`}
          </span>
        </div>
        <div
          className="community-filters"
          role="group"
          aria-label="Circle filters"
        >
          {(
            [
              { id: "for-you", label: "For you" },
              { id: "all", label: "All" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              aria-pressed={v.filter === f.id}
              onClick={() => v.onFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <h2 className="your-circles-title">Your circles</h2>
        {v.notice && <p role="status">{v.notice}</p>}
        <div className="real-circle-list">
          {!v.shown.length && (
            <div className="community-empty">
              {v.groupCount
                ? "No circles match this filter yet. Try All."
                : "No circles yet. They’ll appear here when available."}
            </div>
          )}
          {v.shown.map((group) => {
            const slug = group.slug ?? group.name.toLowerCase();
            const style = circleStyle(slug);
            const circlePeople = v.memberships
              .filter((membership) => membership.groupId === group.id && membership.userId)
              .filter((membership, index, rows) => rows.findIndex((item) => item.userId === membership.userId) === index)
              .slice(0, 3);
            return (
              <article key={group.id} className="real-circle-card">
                <div className="circle-top">
                  <CircleGlyph
                    kind={slug as CircleKind}
                    tint={style.bg}
                    color={style.color}
                    size={48}
                  />
                  <div className="avatar-stack">
                    {circlePeople.map((person, i) => (
                      <PersonAvatar
                        key={person.id}
                        name={v.members[person.userId!]?.name ?? "Bridge member"}
                        size={24}
                        tint={
                          i === 0
                            ? "#F9DCE4"
                            : i === 1
                              ? "#E3E0F8"
                              : "var(--tint)"
                        }
                      />
                    ))}
                  </div>
                </div>
                <h3>{group.name}</h3>
                <div className="live-indicator circle-live">
                  <i className="pulse-dot" />
                  <span>{v.counts[group.id] ?? 0} here now</span>
                </div>
                <div className="topic-label tonight-topic">Tonight's topic</div>
                <div className="real-topic tonight-topic">
                  {v.topics[group.id] === undefined
                    ? "Loading today’s topic…"
                    : v.topics[group.id] ||
                      group.description ||
                      "A place to talk about what you enjoy."}
                </div>
                <div className="circle-actions">
                  <button
                    disabled={v.busy || !v.online}
                    onClick={() => void v.open(group.id)}
                  >
                    Join chat
                  </button>
                  <button
                    disabled={v.busy}
                    onClick={() => void v.open(group.id, true)}
                  >
                    Just read
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
