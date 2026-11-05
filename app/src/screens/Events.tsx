// Real event index, Make details/preparation/reflection, and the three-step create flow.
import { useEffect, useState } from "react";
import { OnboardingMo as Mo } from "../components/OnboardingMo";
import { CircleGlyph, type CircleKind } from "../components/CircleGlyph";
import { MapThumb } from "../components/MapThumb";
import { EventExpectations } from "../components/EventExpectations";
import { PersonAvatar } from "../components/PersonAvatar";
import { CommunityNotice } from "../components/CommunityNotice";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EventWizard } from "./EventWizard";
import { listEvents, getEvent, type EventRecord } from "../lib/data";
import {
  loadCommunity,
  observeContacts,
  action,
  type Group,
  type Member,
  type Contact,
} from "../lib/community";
import {
  myPlannedEventIds,
  loadEventState,
  saveEventPrep,
  rsvpEvent,
  reflectEvent,
} from "../lib/eventActions";
import { eventEnd, calendarText } from "../lib/eventForms";
import { prepFor, type EventFormat } from "../lib/prep";
import type { UserRecord } from "../lib/profile";
import { useOnline } from "../lib/useOnline";
import type { RsvpRecord } from "../lib/rsvp";
import type { Feeling, ReflectionRecord } from "../lib/reflection";
import "./Community.css";
interface Props {
  userId: string;
  profile: UserRecord;
  initialEventId?: string;
  initialCircleId?: string;
  initialCreate?: boolean;
  onPractice: () => void;
  onCircle: (groupId: string) => void;
  onMessage: (userId: string) => void;
  onBack: () => void;
  personalContext: string;
}
function DateTile({ event }: { event: EventRecord }) {
  const date = event.whenAt ? new Date(event.whenAt) : null;
  return (
    <span className="date-tile">
      <small>
        {date?.toLocaleDateString([], { weekday: "short" }).toUpperCase() ??
          "TBD"}
      </small>
      <strong>{date?.getDate() ?? "—"}</strong>
    </span>
  );
}
export function Events({
  userId,
  profile,
  initialEventId,
  initialCircleId,
  initialCreate = false,
  onPractice,
  onCircle,
  onMessage,
  onBack,
  personalContext,
}: Props) {
  const [planned, setPlanned] = useState<string[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<Record<string, Member>>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState(initialEventId ?? "");
  const [creating, setCreating] = useState(initialCreate);
  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming");
  const [rsvps, setRsvps] = useState<RsvpRecord[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);
  const [reflection, setReflection] = useState<ReflectionRecord | null>(null);
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [wins, setWins] = useState<string[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(!!initialEventId);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const online = useOnline();
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [rows, community, planned] = await Promise.all([
          listEvents(),
          loadCommunity(),
          myPlannedEventIds(userId),
        ]);
        if (alive) {
          setEvents(rows);
          setPlanned(planned);
          setGroups(community.groups);
          setMembers(community.members);
          setError("");
          setLoading(false);
        }
      } catch {
        if (alive) {
          setError("Events could not be loaded. Please try again.");
          setLoading(false);
        }
      }
    }
    void load();
    const contacts = observeContacts(setContacts, () =>
      setError("Your contacts could not reconnect. Please try again."),
    );
    return () => {
      alive = false;
      contacts.unsubscribe();
    };
  }, [retry]);
  async function loadDetails(id: string) {
    const [state, event] = await Promise.all([
      loadEventState(userId, id),
      getEvent(id),
    ]);
    if (!event) throw new Error("This event is unavailable.");
    setEvents((rows) => [...rows.filter((r) => r.id !== id), event]);
    setRsvps(state.rsvps);
    setTasks(state.checked);
    setReflection(state.reflection);
    setFeeling((state.reflection?.feeling as Feeling) ?? null);
    setWins((state.reflection?.wins ?? []).filter((s): s is string => !!s));
  }
  useEffect(() => {
    if (!selected) return;
    let alive = true;
    setDetailLoading(true);
    setError("");
    void loadDetails(selected)
      .catch((e) => {
        if (alive)
          setError(
            e instanceof Error
              ? e.message
              : "Event details could not be loaded.",
          );
      })
      .finally(() => {
        if (alive) setDetailLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [selected, retry]);
  function open(id: string) {
    setSelected(id);
    setNotice("");
    const url = new URL(location.href);
    url.searchParams.set("event", id);
    history.replaceState(null, "", url);
  }
  function back() {
    setSelected("");
    setError("");
    setNotice("");
    const url = new URL(location.href);
    url.searchParams.delete("event");
    history.replaceState(null, "", url);
  }
  async function rsvp(status: "going" | "maybe" | "cant") {
    if (busy || !selected) return;
    setBusy(true);
    setError("");
    try {
      await rsvpEvent(selected, status);
      await loadDetails(selected);
      setNotice(
        status === "going"
          ? "You’re in. Your plan and reminder are saved."
          : status === "maybe"
            ? "Maybe saved. You can decide later."
            : "Your RSVP is saved.",
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Your RSVP could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function toggleTask(task: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    const next = tasks.includes(task)
      ? tasks.filter((t) => t !== task)
      : [...tasks, task];
    try {
      await saveEventPrep(userId, selected, next);
      setTasks(next);
    } catch {
      setError("Your preparation could not be saved. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function saveReflection() {
    if (!feeling || busy) return;
    setBusy(true);
    setError("");
    try {
      const currentEvent = events.find((event) => event.id === selected);
      const context = `${personalContext}${
        currentEvent
          ? `\nCurrent event: ${currentEvent.what}; format ${currentEvent.format ?? "not set"}.`
          : ""
      }`.slice(0, 1600);
      const result = await reflectEvent(
        userId,
        selected,
        feeling,
        wins,
        context,
      );
      setReflection(result.reflection);
      setReply(result.reply);
      setNotice("Your private reflection is saved.");
    } catch {
      setError(
        "Your reflection or Mo’s reply could not be saved. Your choices are still here. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function share(event: EventRecord) {
    const url = new URL(location.href);
    url.searchParams.set("event", event.id);
    try {
      if (navigator.share)
        await navigator.share({
          title: event.what,
          text: event.what,
          url: url.toString(),
        });
      else {
        await navigator.clipboard.writeText(url.toString());
        setNotice("Event link copied.");
      }
    } catch (e) {
      if (!(e instanceof Error) || e.name !== "AbortError")
        setError(
          "The link could not be shared. You can copy this page’s address.",
        );
    }
  }
  function calendar(event: EventRecord) {
    try {
      const blob = new Blob([calendarText(event)], {
        type: "text/calendar;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "bridge-event.ics";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice("Calendar file downloaded. Open it to add your event.");
    } catch {
      setError("This event needs a start time before adding it to a calendar.");
    }
  }
  if (loading) return <LoadingSpinner />;
  if (creating)
    return (
      <EventWizard
        userId={userId}
        groups={groups}
        contacts={contacts}
        members={members}
        events={events.filter(
          (e) => e.creatorId === userId || planned.includes(e.id),
        )}
        initialCircleId={initialCircleId}
        textFirst={profile.comfortTextFirst !== false}
        onBack={() => setCreating(false)}
        onCreated={(event, notice) => {
          setEvents((rows) => [
            event,
            ...rows.filter((e) => e.id !== event.id),
          ]);
          setCreating(false);
          open(event.id);
          setNotice(notice);
        }}
      />
    );
  const event = events.find((e) => e.id === selected);
  if (selected) {
    if (detailLoading) return <LoadingSpinner />;
    if (!event)
      return (
        <div className="community-page">
          <div className="community-inner-header">
            <button
              className="round-back"
              aria-label="Back to events"
              onClick={back}
            >
              ‹
            </button>
            <strong>Event details</strong>
            <span />
          </div>
          <CommunityNotice
            online={online}
            error={error || "This event is unavailable."}
            onRetry={() => setRetry((n) => n + 1)}
          />
        </div>
      );
    const past = !!event.whenAt && eventEnd(event) <= Date.now();
    const mine = rsvps.find((r) => r.userId === userId)?.status;
    const attendees = rsvps.filter((r) => r.status === "going");
    const count = event.goingCount ?? attendees.length;
    const circle = groups.find((g) => g.id === event.circleId);
    const slug = circle?.slug ?? circle?.name.toLowerCase() ?? "gaming";
    const prep = prepFor((event.format ?? "text") as EventFormat);
    const host = members[event.creatorId ?? ""]?.name ?? "A Bridge member";
    return (
      <div className="community-page event-detail">
        <div className="community-inner-header">
          <button
            className="round-back"
            aria-label="Back to events"
            onClick={back}
          >
            ‹
          </button>
          <strong>Event details</strong>
          <span />
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
        <div className="event-detail-body">
          <div
            className="event-cover"
            style={{
              background:
                (
                  {
                    gaming: "#F9DCE4",
                    music: "#E3E0F8",
                    anime: "#FBE1D8",
                    cooking: "var(--tint)",
                    art: "#F6E5C9",
                    tech: "#DCE4FA",
                  } as Record<string, string>
                )[slug] ?? "#E4F1F0",
            }}
          >
            <CircleGlyph kind={slug as CircleKind} tint="#FFFFFF" size={52} />
            <span>
              <strong>
                {circle ? `${circle.name} circle` : "Outside circles · friends"}
              </strong>
              <small>Bridge event</small>
            </span>
          </div>
          <div className="event-hero-card">
            <h1>{event.what}</h1>
            <span className="meta-pill">
              {(event.durationMinutes ?? 60) % 60 === 0
                ? `${(event.durationMinutes ?? 60) / 60} hr`
                : `${event.durationMinutes} min`}{" "}
              · {count} {count === 1 ? "person" : "people"}
            </span>
            <div className="event-fact">
              <DateTile event={event} />
              <div>
                <strong>
                  {event.whenAt
                    ? new Date(event.whenAt).toLocaleString([], {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : "Time to be decided"}
                </strong>
                <small>{event.durationMinutes ?? 60} minutes</small>
              </div>
            </div>
            {event.format === "inPerson" ? (
              <div className="venue-detail">
                <div>
                  <strong>
                    {event.venue || event.whereText || "Place to be decided"}
                  </strong>
                  <span>{event.whereText}</span>
                </div>
                <MapThumb />
                <div className="utility-buttons venue-actions">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.whereText || event.venue || "")}`}
                  >
                    Directions
                  </a>
                  <button
                    onClick={() => {
                      void navigator.clipboard
                        .writeText(event.whereText || event.venue || "")
                        .then(() => setNotice("Address copied."))
                        .catch(() =>
                          setError("The address could not be copied."),
                        );
                    }}
                  >
                    Copy address
                  </button>
                </div>
              </div>
            ) : (
              <div className="online-event">
                {past ? (
                  "This event has ended."
                ) : event.joinUrl ? (
                  <a href={event.joinUrl} target="_blank" rel="noreferrer">
                    Open meeting link ↗
                  </a>
                ) : event.circleId ? (
                  <button onClick={() => onCircle(event.circleId!)}>
                    Open circle chat →
                  </button>
                ) : (
                  event.whereText ||
                  "The host hasn’t added meeting instructions yet."
                )}
              </div>
            )}
            <div className="event-host-row">
              <span>Hosted by {host}</span>
              <span>
                {count}
                {event.comfortSize
                  ? ` of ${event.comfortSize} spots`
                  : " going"}
              </span>
            </div>
            <div className="utility-buttons">
              <button onClick={() => calendar(event)}>Add to calendar</button>
              <button onClick={() => void share(event)}>Share</button>
            </div>
          </div>
          <section className="event-section">
            <h2>What to expect</h2>
            <EventExpectations event={event} />
            {attendees.length > 0 && (
              <div className="attendee-summary">
                <div className="avatar-stack">
                  {attendees.slice(0, 4).map((r) => (
                    <PersonAvatar
                      key={r.id}
                      name={members[r.userId ?? ""]?.name ?? "Bridge member"}
                      tint="var(--soft)"
                      size={34}
                    />
                  ))}
                </div>
                <span>{attendees.length} going</span>
              </div>
            )}
          </section>
          {!past && (mine === "going" || mine === "maybe") && (
            <section className="event-section">
              <div className="event-section-title">
                <h2>Get ready with Mo</h2>
                <span>
                  {tasks.length} of {prep.checklist.length}
                </span>
              </div>
              <button className="event-practice" onClick={onPractice}>
                <Mo size={44} />
                <span>
                  <small>Practice first</small>
                  <strong>Join a chat that is already going</strong>
                  <small>A small warm-up before your event.</small>
                </span>
                <b>›</b>
              </button>
              {prep.checklist.map((task) => (
                <button
                  className="prep-task"
                  key={task}
                  aria-pressed={tasks.includes(task)}
                  disabled={busy || !online}
                  onClick={() => void toggleTask(task)}
                >
                  <i aria-hidden="true">{tasks.includes(task) ? "✓" : ""}</i>
                  <span>
                    {(
                      {
                        "plan travel": "Plan how I get there and back",
                        "pick exit line":
                          "Pick my exit line: “I had fun, heading home!”",
                        "pack headphones": "Pack headphones or a fidget",
                        "share plan": "Share my plan with someone I trust",
                        "test mic": "Test my mic, or pick text only",
                        "text only": "Choose text only",
                        "pick opener with Mo": "Pick an opener with Mo",
                        "set a log-off time": "Set a time to log off",
                      } as Record<string, string>
                    )[task] ?? task}
                  </span>
                </button>
              ))}
              <button
                className="event-trusted-share"
                disabled={busy || !online}
                onClick={() => {
                  setBusy(true);
                  void action({ action: "share-event", targetId: event.id })
                    .then((r) =>
                      setNotice(
                        (r.notified ?? 0) > 0
                          ? "Your connected trusted person was notified."
                          : "No trusted person is connected with event-sharing permission yet.",
                      ),
                    )
                    .catch(() => setError("Your plan could not be shared."))
                    .finally(() => setBusy(false));
                }}
              >
                Share my plan with my connected trusted person
              </button>
            </section>
          )}
          {!past && !mine && (
            <p className="event-hint">
              Tap “I’m in” and Mo will help you get ready.
            </p>
          )}
          {past && (
            <section className="event-section">
              <div className="reflection-title">
                <Mo size={44} />
                <h2>How did it go?</h2>
              </div>
              {reflection ? (
                <>
                  <p>{reply || "Your private reflection is saved."}</p>
                  <p>
                    {reflection.wins?.filter(Boolean).join(" · ") ||
                      "Taking a moment to reflect counts."}
                  </p>
                  <button
                    className="quiet-action"
                    onClick={() => setReflection(null)}
                  >
                    Edit reflection
                  </button>
                </>
              ) : (
                <>
                  <div
                    className="wizard-chips"
                    role="group"
                    aria-label="How did it go?"
                  >
                    {(
                      [
                        { id: "hard", label: "It was hard" },
                        { id: "okay", label: "It was okay" },
                        { id: "good", label: "It went well" },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        disabled={busy}
                        aria-pressed={feeling === f.id}
                        onClick={() => setFeeling(f.id)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <strong>Anything you’re proud of?</strong>
                  <div className="wizard-chips" role="group" aria-label="Wins">
                    {[
                      "I said hi",
                      "I asked a question",
                      "I stayed as long as I wanted",
                      "I left kindly",
                    ].map((win) => (
                      <button
                        key={win}
                        disabled={busy}
                        aria-pressed={wins.includes(win)}
                        onClick={() =>
                          setWins((rows) =>
                            rows.includes(win)
                              ? rows.filter((w) => w !== win)
                              : [...rows, win],
                          )
                        }
                      >
                        {win}
                      </button>
                    ))}
                  </div>
                  <small>Only you see this.</small>
                  <button
                    className="event-save-reflection"
                    disabled={!feeling || busy || !online}
                    onClick={() => void saveReflection()}
                  >
                    {busy ? "Saving…" : "Save reflection"}
                  </button>
                </>
              )}
            </section>
          )}
          {past && attendees.some((r) => r.userId !== userId) && (
            <section className="event-section">
              <h2>Stay in touch</h2>
              <span>People who joined this event</span>
              {attendees
                .filter((r) => r.userId && r.userId !== userId)
                .map((r) => (
                  <div className="stay-contact" key={r.id}>
                    <PersonAvatar
                      name={members[r.userId!]?.name ?? "Bridge member"}
                      size={40}
                    />
                    <strong>
                      {members[r.userId!]?.name ?? "Bridge member"}
                    </strong>
                    <button onClick={() => onMessage(r.userId!)}>
                      Message
                    </button>
                  </div>
                ))}
              <small>
                Your first message is a request. They choose whether to accept.
              </small>
            </section>
          )}
        </div>
        {!past && (
          <div className="event-rsvp-footer">
            <div className="rsvp-control" role="group" aria-label="RSVP">
              {(
                [
                  { id: "going", label: "Going" },
                  { id: "maybe", label: "Maybe" },
                  { id: "cant", label: "Can't go" },
                ] as const
              ).map((option) => (
                <button
                  className={mine === option.id ? "on" : ""}
                  aria-pressed={mine === option.id}
                  disabled={
                    busy ||
                    !online ||
                    (option.id === "going" &&
                      mine !== "going" &&
                      !!event.comfortSize &&
                      count >= event.comfortSize)
                  }
                  key={option.id}
                  onClick={() => void rsvp(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  const visible = events
    .filter(
      (e) =>
        filter === "all" ||
        (filter === "past"
          ? eventEnd(e) > 0 && eventEnd(e) <= Date.now()
          : !e.whenAt || eventEnd(e) > Date.now()),
    )
    .sort((a, b) =>
      filter === "past"
        ? Date.parse(b.whenAt ?? "") - Date.parse(a.whenAt ?? "")
        : Date.parse(a.whenAt ?? "") - Date.parse(b.whenAt ?? ""),
    );
  return (
    <div className="community-page tab-screen">
      <div className="tab-sticky-header">
        <div className="community-title">
          <h1 className="tab-page-title">Events</h1>
          <button className="community-events" onClick={onBack}>
            Circles →
          </button>
        </div>
        <div
          className="community-filters"
          role="group"
          aria-label="Event filters"
        >
          {(["upcoming", "past", "all"] as const).map((f) => (
            <button
              key={f}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === "upcoming" ? "Upcoming" : f === "past" ? "Past" : "All"}
            </button>
          ))}
        </div>
      </div>
      <CommunityNotice
        online={online}
        error={error}
        onRetry={() => {
          setLoading(true);
          setRetry((n) => n + 1);
        }}
      />
      <div className="tab-screen-content event-index">
        <button
          className="event-create"
          disabled={!online}
          onClick={() => setCreating(true)}
        >
          + Create event
        </button>
        {visible.length === 0 ? (
          <div className="community-empty">
            {events.length
              ? "No events match this filter."
              : "No events yet. Plan something small when you’re ready."}
          </div>
        ) : (
          visible.map((e) => (
            <button
              className="event-row-card"
              key={e.id}
              onClick={() => open(e.id)}
            >
              <DateTile event={e} />
              <span className="event-copy">
                <strong>{e.what}</strong>
                <span>
                  {e.whenAt
                    ? new Date(e.whenAt).toLocaleString([], {
                        weekday: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : "Time to be decided"}
                </span>
                <span>
                  {e.venue || e.whereText || e.format || "Place to be decided"}
                </span>
                <span className="meta-pill">
                  {e.goingCount ?? 0}
                  {e.comfortSize ? ` of ${e.comfortSize} spots` : " going"}
                </span>
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
