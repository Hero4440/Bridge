// Home geometry and copy follow the supplied Make export. All domain data is live.
import { useEffect, useRef, useState } from "react";
import { OnboardingMo as Mo } from "../components/OnboardingMo";
import { CircleGlyph, type CircleKind } from "../components/CircleGlyph";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorRetry } from "../components/ErrorRetry";
import { recommendation, type CheckInValues } from "../lib/checkin";
import {
  loadDashboard,
  saveGoal,
  deleteGoal,
  observeNotifications,
  readNotification,
  observePresence,
  activeCounts,
  type Goal,
  type Circle,
  type Notification,
} from "../lib/dashboard";
import type { UserRecord } from "../lib/profile";
import type { ScenarioId } from "../lib/practice";
import { useOnline } from "../lib/useOnline";
import "./Dashboard.css";
const circleStyles: Record<string, { bg: string; color: string }> = {
  gaming: { bg: "#FFF0EA", color: "#D4733A" },
  music: { bg: "#EEF0FA", color: "#5A4FB0" },
  anime: { bg: "#FEF0FA", color: "#8A3A9A" },
  cooking: { bg: "#FFF6E8", color: "#B07A20" },
  art: { bg: "#FDE8EF", color: "#A03060" },
  tech: { bg: "var(--tint)", color: "#3A7A5C" },
};
interface Props {
  onMessage?: (id: string) => void;
  onEvent?: (id?: string) => void;
  profile: UserRecord;
  checkIn: CheckInValues;
  onPractice: (scenario: ScenarioId, level: 1 | 2 | 3) => void;
  onCircle: (id: string) => void;
  onComfort: () => void;
  angryDebrief?: boolean;
  onDebriefTalk?: () => void;
  onMoChat?: () => void;
}
export function Home({
  profile,
  checkIn,
  onPractice,
  onCircle,
  onComfort,
  onEvent,
  onMessage,
  angryDebrief = false,
  onDebriefTalk,
  onMoChat,
}: Props) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [drafts, setDrafts] = useState<Goal[]>([]);
  const [editing, setEditing] = useState(false);
  const [steps, setSteps] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const lock = useRef(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [presenceError, setPresenceError] = useState(false);
  const online = useOnline();
  const [hour, setHour] = useState(() => new Date().getHours());
  useEffect(() => {
    const timer = setInterval(() => setHour(new Date().getHours()), 60000);
    return () => clearInterval(timer);
  }, []);
  async function load(retry = false) {
    if (retry) {
      setLoading(true);
      setLoadError("");
    }
    try {
      const data = await loadDashboard();
      setCircles(data.circles);
      setGoals(data.goals);
      setSteps(data.steps);
    } catch (e) {
      setLoadError(
        e instanceof Error ? e.message : "Your Home could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  useEffect(() => {
    const ns = observeNotifications(setNotifications, () =>
      setError("Notifications could not reconnect. Reopen Home to try again."),
    );
    let latest: Parameters<typeof activeCounts>[0] = [];
    const ps = observePresence(
      (rows) => {
        latest = rows;
        setCounts(activeCounts(rows));
        setPresenceError(false);
      },
      () => setPresenceError(true),
    );
    const timer = window.setInterval(
      () => setCounts(activeCounts(latest)),
      15000,
    );
    return () => {
      ns.unsubscribe();
      ps.unsubscribe();
      clearInterval(timer);
    };
  }, []);
  async function editPlan() {
    if (lock.current) return;
    setError("");
    if (!editing) {
      setDrafts(goals.map((g) => ({ ...g })));
      setEditing(true);
      return;
    }
    if (!online) {
      setError("Reconnect to save your plan. Your edits are still here.");
      return;
    }
    lock.current = true;
    setSaving(true);
    try {
      // Validate all text before changing any rows. Stable IDs make a retry safe.
      if (drafts.some((g) => !g.text.trim() || g.text.trim().length > 160))
        throw new Error("Write each goal with 1–160 characters, or remove it.");
      const saved: Goal[] = [];
      for (const [i, g] of drafts.entries())
        saved.push(
          await saveGoal(
            { ...g, position: i },
            !goals.some((old) => old.id === g.id),
          ),
        );
      for (const g of goals)
        if (!drafts.some((d) => d.id === g.id)) await deleteGoal(g.id);
      setSteps(
        (n) =>
          n -
          goals.filter((g) => g.done).length +
          saved.filter((g) => g.done).length,
      );
      setGoals(saved);
      setEditing(false);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Your plan could not be saved. Try Done again.",
      );
    } finally {
      setSaving(false);
      lock.current = false;
    }
  }
  async function toggle(goal: Goal) {
    if (editing) {
      setDrafts((rows) =>
        rows.map((g) => (g.id === goal.id ? { ...g, done: !g.done } : g)),
      );
      return;
    }
    if (lock.current || !online) return;
    lock.current = true;
    setSaving(true);
    setError("");
    try {
      const updated = await saveGoal({ ...goal, done: !goal.done });
      setGoals((rows) => rows.map((g) => (g.id === goal.id ? updated : g)));
      setSteps((n) => n + (updated.done ? 1 : -1));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Your goal could not be saved. Try again.",
      );
    } finally {
      setSaving(false);
      lock.current = false;
    }
  }
  function addGoal() {
    setDrafts((rows) => [
      ...rows,
      {
        id: crypto.randomUUID(),
        text: "",
        done: false,
        position: rows.length,
        week: "",
        createdAt: "",
        updatedAt: "",
      } as Goal,
    ]);
  }
  async function markRead(id: string) {
    setError("");
    try {
      await readNotification(id);
    } catch {
      setError("Could not mark the notification as read. Please try again.");
    }
  }
  if (loading) return <LoadingSpinner />;
  if (loadError)
    return <ErrorRetry error={loadError} onRetry={() => void load(true)} />;
  if (showNotifications)
    return (
      <section className="dashboard-panel">
        <button onClick={() => setShowNotifications(false)}>
          ← Back to Home
        </button>
        <h1>Notifications</h1>
        {!online && (
          <p role="status">
            You’re offline. Reconnect to update notifications.
          </p>
        )}
        {error && <p role="alert">{error}</p>}
        {notifications.length === 0 ? (
          <div className="dashboard-empty">
            You’re all caught up. New notifications will appear here.
          </div>
        ) : (
          notifications.map((n) => (
            <article key={n.id} className="dashboard-empty">
              <p>{n.message}</p>
              <time>
                {new Date(n.timestamp ?? n.createdAt).toLocaleString()}
              </time>
              {n.peerId && onMessage && (
                <button
                  onClick={() => {
                    void markRead(n.id);
                    onMessage(n.peerId!);
                  }}
                >
                  Open message
                </button>
              )}
              {n.eventId && onEvent && (
                <button onClick={() => onEvent(n.eventId!)}>Open event</button>
              )}
              {!n.read && (
                <button disabled={!online} onClick={() => void markRead(n.id)}>
                  Mark as read
                </button>
              )}
            </article>
          ))
        )}
      </section>
    );
  const rec = recommendation(checkIn);
  const interests = (profile.interests ?? []).map((i) => i?.toLowerCase());
  const order = Object.keys(circleStyles);
  const sorted = [...circles]
    .sort((a, b) => {
      const first = (a.slug ?? a.name).toLowerCase();
      const second = (b.slug ?? b.name).toLowerCase();
      return (
        Number(interests.includes(second)) -
          Number(interests.includes(first)) ||
        (order.indexOf(first) < 0 ? 99 : order.indexOf(first)) -
          (order.indexOf(second) < 0 ? 99 : order.indexOf(second)) ||
        a.name.localeCompare(b.name)
      );
    })
    .slice(0, 3);
  const v = {
    greeting:
      hour < 12
        ? "Good morning"
        : hour <= 17
          ? "Good afternoon"
          : "Good evening",
    firstName: profile.firstName?.trim() || "there",
    steps,
    stepsWord: steps === 1 ? "brave step" : "brave steps",
    barNotifCount: notifications.filter((n) => !n.read).length,
    notifLabel: "Notifications",
    openNotifs: () => setShowNotifications(true),
    homeMood: (checkIn.feeling === "over" ? "calm" : "happy") as
      | "calm"
      | "happy",
    angryDebrief,
    debriefTalk: () => {
      onDebriefTalk?.();
      onPractice(rec.scenario, rec.level);
    },
    calmOn: !!profile.comfortCalmMode,
    moLine: rec.line,
    goComfort: onComfort,
    homeTodayTitle: rec.title,
    homePicked: rec.picked,
    homeStart: () => onPractice(rec.scenario, rec.level),
    homeActive: sorted.reduce((sum, c) => sum + (counts[c.id] ?? 0), 0),
    homeCircles: sorted.map((c) => {
      const slug = (c.slug ?? c.name).toLowerCase();
      const style = circleStyles[slug] ?? {
        bg: "var(--tint)",
        color: "var(--accent)",
      };
      return {
        key: slug as CircleKind,
        name: c.name,
        isNew: !interests.includes(slug),
        here: counts[c.id] ?? 0,
        color: style.color,
        iconBg: style.bg,
        open: () => onCircle(c.id),
      };
    }),
    planEdit: editing,
    planGoals: editing ? drafts : goals,
  };
  return (
    <div className="matched-home" aria-busy={saving}>
      {!online && (
        <p className="dashboard-notice" role="status">
          You’re offline. Reconnect to save changes.
        </p>
      )}
      {error && (
        <p className="dashboard-notice dashboard-error" role="alert">
          {error}
        </p>
      )}
      <div className="tab-screen">
        <div
          className="tab-sticky-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            padding: "20px 20px 0",
          }}
        >
          <h1
            style={{
              margin: "0",
              fontSize: "20px",
              fontWeight: "600",
              color: "var(--ink)",
              minWidth: "0",
            }}
          >
            {v.greeting}, {v.firstName}
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flex: "0 0 auto",
            }}
          >
            <span
              style={{
                background: "rgba(30,27,46,0.08)",
                borderRadius: "999px",
                padding: "6px 12px",
                fontSize: "13px",
                fontWeight: "500",
                color: "var(--ink)",
                whiteSpace: "nowrap",
              }}
            >
              {v.steps} {v.stepsWord}
            </span>
            <button
              onClick={v.openNotifs}
              aria-label={v.notifLabel}
              style={{
                position: "relative",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "none",
                padding: "0",
                background: "rgba(30,27,46,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1E1B2E"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"></path>
                <path d="M10 20.5a2 2 0 0 0 4 0"></path>
              </svg>
              {v.barNotifCount > 0 && (
                <>
                  <span
                    className="badge-dot"
                    style={{
                      position: "absolute",
                      top: "-2px",
                      right: "-2px",
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: "#E85D5D",
                      color: "#FFFFFF",
                      fontSize: "9px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: "1",
                    }}
                  >
                    {v.barNotifCount}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
        <div className="tab-screen-content home-content">
          <div
            className="home-card"
            role={!v.angryDebrief ? "button" : undefined}
            tabIndex={!v.angryDebrief ? 0 : undefined}
            onClick={!v.angryDebrief ? onMoChat : undefined}
            onKeyDown={!v.angryDebrief ? (e) => { if (e.key === 'Enter' || e.key === ' ') onMoChat?.(); } : undefined}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              gap: "12px",
              cursor: !v.angryDebrief ? "pointer" : undefined,
            }}
          >
            <div
              style={{
                flex: "0 0 auto",
                borderRadius: "50%",
                boxShadow: v.angryDebrief ? "0 0 0 4px #FFF0EA" : "none",
              }}
            >
              <Mo mood={v.homeMood} size={48} />
            </div>
            <div
              style={{
                flex: "1",
                minWidth: "0",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div className="speech-bubble mo-bubble">
                {v.angryDebrief
                  ? "How are you feeling now? Want to talk through what happened?"
                  : v.calmOn
                    ? v.moLine.split(/(?<=[.!?])\s+/)[0]
                    : v.moLine}
              </div>
              {v.angryDebrief && (
                <>
                  <button
                    onClick={v.debriefTalk}
                    style={{
                      alignSelf: "flex-start",
                      height: "40px",
                      borderRadius: "999px",
                      border: "none",
                      background: "var(--accent)",
                      color: "#FFFFFF",
                      fontSize: "14px",
                      fontWeight: "500",
                      padding: "0 18px",
                    }}
                  >
                    Yes, let's talk
                  </button>
                </>
              )}
            </div>
          </div>
          {v.calmOn && (
            <>
              <button
                onClick={v.goComfort}
                style={{
                  alignSelf: "flex-start",
                  border: "none",
                  background: "var(--tint)",
                  borderRadius: "999px",
                  padding: "4px 12px",
                  fontSize: "12px",
                  color: "var(--accent)",
                  marginTop: "-8px",
                }}
              >
                Calm mode on
              </button>
            </>
          )}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "20px",
              boxShadow: "0 2px 12px rgba(30,27,46,0.07)",
              padding: "16px 20px",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                flex: "1",
                minWidth: "0",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--muted)",
                  fontWeight: "500",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Today's practice
              </span>
              <span
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "var(--ink)",
                  lineHeight: "1.3",
                  display: "-webkit-box",
                  WebkitLineClamp: "2",
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {v.homeTodayTitle}
              </span>
              {v.homePicked && (
                <>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--accent)",
                      fontWeight: "500",
                    }}
                  >
                    • Picked for you
                  </span>
                </>
              )}
            </div>
            <button
              onClick={v.homeStart}
              style={{
                flex: "0 0 auto",
                background: "var(--ink)",
                color: "#FFFFFF",
                borderRadius: "999px",
                padding: "10px 18px",
                fontSize: "14px",
                fontWeight: "600",
                border: "none",
              }}
            >
              Start →
            </button>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "var(--ink)",
                }}
              >
                Your circles
              </span>
              <span
                style={{
                  background: "var(--tint)",
                  color: "var(--accent)",
                  borderRadius: "999px",
                  padding: "2px 10px",
                  fontSize: "11px",
                }}
              >
                {presenceError
                  ? "Activity unavailable"
                  : `${v.homeActive} active now`}
              </span>
            </div>
            <div className="h-scroll">
              {v.homeCircles.length === 0 && (
                <div className="dashboard-empty">
                  No circles yet. They’ll appear here when available.
                </div>
              )}
              {v.homeCircles.map((c, $i) => (
                <button key={$i} onClick={c.open} className="mini-circle">
                  <CircleGlyph
                    kind={c.key}
                    tint={c.iconBg}
                    color={c.color}
                    size={48}
                  />
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "var(--ink)",
                    }}
                  >
                    {c.name}
                  </span>
                  {c.isNew && (
                    <span
                      className="meta-pill"
                      style={{ fontSize: "11px", padding: "2px 8px" }}
                    >
                      New for you
                    </span>
                  )}
                  <span className="mini-meta live-indicator">
                    <i className="pulse-dot"></i>
                    {presenceError
                      ? "Activity unavailable"
                      : `${c.here} here now`}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "2px",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "var(--ink)",
                }}
              >
                My plan this week
              </span>
              <button
                disabled={saving}
                onClick={() => void editPlan()}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: "0",
                  fontSize: "13px",
                  color: "var(--muted)",
                }}
              >
                {v.planEdit ? "Done" : "Edit →"}
              </button>
            </div>
            {v.planGoals.map((g) => (
              <div
                key={g.id}
                style={{
                  background: "#FFFFFF",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  boxShadow: "0 1px 6px rgba(30,27,46,0.06)",
                }}
              >
                <button
                  disabled={saving || !online}
                  onClick={() => void toggle(g)}
                  role="checkbox"
                  aria-checked={g.done}
                  aria-label={g.text}
                  style={{
                    width: "22px",
                    height: "22px",
                    flex: "0 0 auto",
                    padding: "0",
                    border: "none",
                    background: "transparent",
                    display: "flex",
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill={g.done ? "var(--accent)" : "none"}
                    stroke={g.done ? "var(--accent)" : "var(--muted)"}
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="10"></circle>
                    {g.done && (
                      <path
                        d="M6.5 11.5l3 3 6-6.5"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      ></path>
                    )}
                  </svg>
                </button>
                {v.planEdit ? (
                  <input
                    value={g.text}
                    onChange={(e) =>
                      setDrafts((rows) =>
                        rows.map((r) =>
                          r.id === g.id ? { ...r, text: e.target.value } : r,
                        ),
                      )
                    }
                    aria-label="Goal"
                    maxLength={160}
                    disabled={saving}
                    style={{
                      flex: "1",
                      minWidth: "0",
                      border: "none",
                      borderBottom: "1.5px solid rgba(30,27,46,0.08)",
                      background: "transparent",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "var(--ink)",
                      outline: "none",
                      fontFamily: "inherit",
                      padding: "2px 0",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: g.done ? "var(--muted)" : "var(--ink)",
                      textDecoration: g.done ? "line-through" : "none",
                    }}
                  >
                    {g.text}
                  </span>
                )}
                {editing && (
                  <button
                    className="goal-remove"
                    aria-label={`Remove ${g.text || "goal"}`}
                    disabled={saving}
                    onClick={() =>
                      setDrafts((rows) => rows.filter((r) => r.id !== g.id))
                    }
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {editing ? (
              <div className="plan-actions">
                <button disabled={saving} onClick={addGoal}>
                  + Add goal
                </button>
                <button
                  disabled={saving}
                  onClick={() => {
                    setEditing(false);
                    setError("");
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              goals.length === 0 && (
                <div className="dashboard-empty">
                  Choose one small step for this week. Tap Edit to add your
                  plan.
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
