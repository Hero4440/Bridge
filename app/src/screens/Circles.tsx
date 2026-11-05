// Make Circles and live chat with persisted membership, real topics, events, and explicit safety actions.
import { CIRCLE_IDEAS_CONTEXT } from '../../amplify/functions/preview/prompts';
import { useEffect, useRef, useState } from "react";
import { OnboardingMo as Mo } from "../components/OnboardingMo";
import { PersonAvatar } from "../components/PersonAvatar";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { CircleListView } from "./CircleListView";
import { CommunityNotice } from "../components/CommunityNotice";
import { MessageComposer } from "../components/MessageComposer";
import {
  observeContacts,
  type Contact,
  loadCommunity,
  joinCircle,
  leaveMembership,
  updateMembership,
  sendCircle,
  report,
  action,
  type Group,
  type Member,
  type Membership,
} from "../lib/community";
import { getDailyTopic } from "../lib/topics";
import { observeMessages, type MessageRecord } from "../lib/messages";
import {
  observePresence,
  heartbeat,
  leaveCircle,
  activeCounts,
} from "../lib/dashboard";
import { messageTime, dayLabel } from "../lib/chat";
import { listEvents, type EventRecord } from "../lib/data";
import { useOnline } from "../lib/useOnline";
import { withMoMessages } from "../lib/moContext";
import type { UserRecord } from "../lib/profile";
import type { Schema } from "../../amplify/data/resource";
import "./Community.css";
interface Props {
  userId: string;
  profile: UserRecord;
  feeling?: string;
  initialCircleId?: string;
  onOpenDms: (peerId?: string) => void;
  onEvents: (eventId?: string, groupId?: string, create?: boolean) => void;
  personalContext: string;
}
export function Circles({
  userId,
  profile,
  feeling,
  initialCircleId,
  onOpenDms,
  onEvents,
  personalContext,
}: Props) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<Record<string, Member>>({});
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [topics, setTopics] = useState<Record<string, string>>({});
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [selected, setSelected] = useState(initialCircleId ?? "");
  const [reading, setReading] = useState(false);
  const [filter, setFilter] = useState<"for-you" | "all">("for-you");
  const [dismissedWarnings,setDismissedWarnings]=useState<string[]>([]);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [presences, setPresences] = useState<
    Schema["CirclePresence"]["type"][]
  >([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(!!initialCircleId);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [retry, setRetry] = useState(0);
  const [menu, setMenu] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  useEffect(() => {
    const sub = observeContacts(setContacts, () =>
      setNotice(
        "Your blocked people could not be loaded. Reopen Circles to try again.",
      ),
    );
    return () => sub.unsubscribe();
  }, []);
  const online = useOnline();
  const end = useRef<HTMLDivElement>(null);
  const initialOpened = useRef(false);
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [data, eventRows] = await Promise.all([
          loadCommunity(),
          listEvents(),
        ]);
        if (!alive) return;
        setGroups(data.groups);
        setMembers(data.members);
        setMemberships(data.memberships);
        setEvents(eventRows);
        setError("");
        setLoading(false);
        for (const group of data.groups) {
          void getDailyTopic(group.id, group.name)
            .then((topic) => {
              if (alive) setTopics((t) => ({ ...t, [group.id]: topic.text }));
            })
            .catch(() => {
              if (alive) setTopics((t) => ({ ...t, [group.id]: "" }));
            });
        }
      } catch {
        if (alive) {
          setError("Circles could not be loaded. Please try again.");
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      alive = false;
    };
  }, [retry]);
  useEffect(() => {
    let rows: Schema["CirclePresence"]["type"][] = [];
    const sub = observePresence(
      (items) => {
        rows = items;
        setPresences(items);
        setCounts(activeCounts(items));
      },
      () => setNotice("Activity is unavailable. You can still open a circle."),
    );
    const timer = setInterval(() => setCounts(activeCounts(rows)), 15000);
    return () => {
      sub.unsubscribe();
      clearInterval(timer);
    };
  }, [retry, online]);
  useEffect(() => {
    if (!selected) return;
    let active = true;
    const sub = observeMessages(
      selected,
      (rows) => {
        if (active) {
          setMessages(rows);
          setChatLoading(false);
        }
      },
      () => {
        if (active) {
          setError("Chat could not reconnect. Your draft is still here.");
          setChatLoading(false);
        }
      },
    );
    const publish = () => {
      if (navigator.onLine)
        void heartbeat(userId, selected).catch(() => undefined);
    };
    publish();
    const timer = setInterval(publish, 30000);
    return () => {
      active = false;
      sub.unsubscribe();
      clearInterval(timer);
      void leaveCircle(userId).catch(() => undefined);
    };
  }, [selected, userId, retry, online]);
  useEffect(() => {
    end.current?.scrollIntoView({
      behavior: profile.comfortCalmMode ? "instant" : "smooth",
      block: "end",
    });
  }, [messages, profile.comfortCalmMode]);
  useEffect(() => {
    if (initialCircleId && !loading && !initialOpened.current) {
      initialOpened.current = true;
      void joinCircle(userId, initialCircleId)
        .then((row) => {
          if (row)
            setMemberships((rows) => [
              ...rows.filter((r) => r.id !== row.id),
              row,
            ]);
        })
        .catch(() => {
          setReading(true);
          setError("This circle opened in reading mode. Try Say hi to join.");
        });
    }
  }, [initialCircleId, loading, userId]);
  async function open(groupId: string, readOnly = false) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (!readOnly) {
        const row = await joinCircle(userId, groupId);
        if (row)
          setMemberships((rows) => [
            ...rows.filter((r) => r.id !== row.id),
            row,
          ]);
      }
      setSelected(groupId);
      setReading(readOnly);
      setMessages([]);
      setChatLoading(true);
      setMenu(false);
    } catch {
      setError("This circle could not be joined. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function safety(kind: "report" | "block", targetId: string) {
    setBusy(true);
    setError("");
    try {
      if (kind === "report") {
        await report(targetId, "user", "Circle chat concern");
        setNotice("Report sent for review.");
      } else {
        await action({ action: "block", targetId });
        setNotice("Person blocked. Their messages are hidden.");
        setMessages((rows) => rows.filter((m) => m.senderId !== targetId));
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "The safety action could not be completed.",
      );
    } finally {
      setBusy(false);
    }
  }
  const circle = groups.find((g) => g.id === selected);
  const membership = memberships.find((m) => m.groupId === selected);
  const interests = (profile.interests ?? []).map((i) => i?.toLowerCase());
  const shown = groups.filter(
    (g) =>
      filter === "all" || interests.includes((g.slug ?? g.name).toLowerCase()),
  );
  if (loading) return <LoadingSpinner />;
  if (!selected)
    return (
      <CircleListView
        groupCount={groups.length}
        onOpenDms={() => onOpenDms()}
        onRetry={() => {
          setLoading(true);
          setRetry((n) => n + 1);
        }}
        onFilter={setFilter}
        open={open}
        online={online}
        error={error}
        feeling={feeling}
        interests={interests}
        filter={filter}
        notice={notice}
        shown={shown}
        busy={busy}
        presences={presences}
        counts={counts}
        members={members}
        topics={topics}
      />
    );
  return (
    <div className="community-page circle-chat">
      <div className="community-inner-header">
        <button
          className="round-back"
          aria-label="Back to circles"
          onClick={() => {
            setSelected("");
            setError("");
            setMenu(false);
          }}
        >
          ‹
        </button>
        <div>
          <strong>{circle?.name ?? "Circle"} circle</strong>
          <small>{topics[selected] || circle?.description}</small>
        </div>
        <button
          className="round-back"
          aria-label="Safety options"
          aria-expanded={menu}
          onClick={() => setMenu((v) => !v)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <path d="M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6l-7-3Z" />
          </svg>
        </button>
      </div>
      <CommunityNotice
        online={online}
        error={error}
        onRetry={() => setRetry((n) => n + 1)}
      />
      {notice && (
        <p className="community-notice" role="status">
          {notice}
        </p>
      )}
      {menu && (
        <div className="circle-safety">
          <button
            disabled={busy || !online}
            onClick={() => {
              setBusy(true);
              void report(selected, "circle", "Circle chat concern")
                .then(() => setNotice("Report sent for review."))
                .catch(() => setError("The report could not be saved."))
                .finally(() => setBusy(false));
            }}
          >
            Report chat
          </button>
          {membership && (
            <>
              <button
                disabled={busy || !online}
                onClick={() => {
                  void updateMembership(membership.id, {
                    muted: !membership.muted,
                  })
                    .then((row) => {
                      if (row)
                        setMemberships((rows) =>
                          rows.map((r) => (r.id === row.id ? row : r)),
                        );
                    })
                    .catch(() =>
                      setError("Your circle preference could not be saved."),
                    );
                }}
              >
                {membership.muted ? "Unmute circle" : "Mute circle"}
              </button>
              <button
                disabled={!online}
                onClick={() => {
                  void leaveMembership(membership.id)
                    .then(() => {
                      setMemberships((rows) =>
                        rows.filter((r) => r.id !== membership.id),
                      );
                      setReading(true);
                      setMenu(false);
                    })
                    .catch(() => setError("The circle could not be left."));
                }}
              >
                Leave circle
              </button>
            </>
          )}
        </div>
      )}
      <div className="circle-events">
        {events
          .filter(
            (e) =>
              e.circleId === selected &&
              !!e.whenAt &&
              Date.parse(e.whenAt) > Date.now(),
          )
          .slice(0, 3)
          .map((e) => (
            <button
              key={e.id}
              className="event-row-card"
              onClick={() => onEvents(e.id)}
            >
              <span className="date-tile">
                <small>
                  {new Date(e.whenAt!)
                    .toLocaleDateString([], { weekday: "short" })
                    .toUpperCase()}
                </small>
                <strong>{new Date(e.whenAt!).getDate()}</strong>
              </span>
              <span className="event-copy">
                <strong>{e.what}</strong>
                <span>
                  {new Date(e.whenAt!).toLocaleString([], {
                    weekday: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                <span>{e.venue || e.whereText || e.format}</span>
              </span>
            </button>
          ))}
        <button
          className="plan-circle-event"
          onClick={() => onEvents(undefined, selected, true)}
        >
          + Plan an event in {circle?.name ?? "this circle"}
        </button>
      </div>
      <div className="real-messages">
        {chatLoading ? (
          <LoadingSpinner />
        ) : !messages.length ? (
          <div className="community-empty">
            No messages yet. You can say hi or read quietly.
          </div>
        ) : (
          messages
            .filter(
              (m) =>
                !contacts.some(
                  (c) => c.status === "blocked" && c.contactId === m.senderId,
                ),
            )
            .map((m, i) => {
              const me = m.senderId === userId;
              const name = members[m.senderId ?? ""]?.name ?? "Bridge member";
              return (
                <div key={m.id}>
                  {(i === 0 ||
                    dayLabel(m.timestamp ?? m.createdAt) !==
                      dayLabel(
                        messages[i - 1].timestamp ?? messages[i - 1].createdAt,
                      )) && (
                    <div className="today-divider">
                      {dayLabel(m.timestamp ?? m.createdAt)}
                    </div>
                  )}
                  <div className={`chat-group${me ? " me" : ""}`}>
                    {!me && (
                      <PersonAvatar
                        name={name}
                        size={28}
                        tint="var(--tint)"
                        onClick={() => onOpenDms(m.senderId ?? undefined)}
                      />
                    )}
                    <div>
                      {!me && <span className="message-name">{name}</span>}
                      <div className={`real-message-bubble${me ? " own" : ""}`}>
                        {m.content}
                      </div>
                      <div className="chat-meta">
                        {messageTime(m.timestamp ?? m.createdAt)}
                      </div>
                      {!me && m.senderId && (
                        <details className="message-actions">
                          <summary aria-label={`Options for ${name}’s message`}>
                            ···
                          </summary>
                          <button
                            disabled={busy || !online}
                            onClick={() => void safety("report", m.senderId!)}
                          >
                            Report {name}
                          </button>
                          <button
                            disabled={busy || !online}
                            onClick={() => void safety("block", m.senderId!)}
                          >
                            Block {name}
                          </button>
                        </details>
                      )}
                    </div>
                  </div>
                {!me&&m.unsafe&&!dismissedWarnings.includes(m.id)&&<div className="circle-unsafe-card"><div><Mo mood="worried" size={52}/><span>Only you can see this warning. Mo flagged this message. Be careful with requests for money or private details.</span></div><div><button disabled={busy||!online} onClick={()=>void safety('report',m.senderId!)}>Report {name}</button><button disabled={busy||!online} onClick={()=>void safety('block',m.senderId!)}>Block {name}</button><button onClick={()=>setDismissedWarnings(ids=>[...ids,m.id])}>Not now</button></div></div>}
                </div>
              );
            })
        )}
        <div ref={end} />
      </div>
      {reading ? (
        <div className="reading-card">
          <Mo mood="calm" size={44} />
          <span>Reading quietly counts. Say hi only if you want to.</span>
          <button
            disabled={!online || busy}
            onClick={() => void open(selected)}
          >
            Say hi
          </button>
        </div>
      ) : (
        <MessageComposer
          name={`${circle?.name ?? "circle"} chat`}
          online={online}
          context={CIRCLE_IDEAS_CONTEXT(circle?.name??'',topics[selected]??'')}
          personalContext={withMoMessages(
            personalContext,
            messages.map((message) => ({
              speaker:
                message.senderId === userId
                  ? "You"
                  : members[message.senderId ?? ""]?.name ?? "Circle member",
              text: message.content,
            })),
          )}
          onSend={async (text, id) => {
            await sendCircle(selected, text, id);
          }}
        />
      )}
    </div>
  );
}
